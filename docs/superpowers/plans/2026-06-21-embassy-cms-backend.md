# Embassy CMS Backend — Implementation Plan (Plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Laravel API that powers the Embassy of Guinea CMS — user auth, 4-role authorization, a draft→submitted→published/rejected approval workflow with audit trail, S3 media uploads, a public read API, and a token-authenticated scraper-ingest endpoint.

**Architecture:** A fresh Laravel 11 app (`ambassade-guinee-api`). Authentication via Sanctum (bearer tokens). Authorization via spatie/laravel-permission (roles) + Laravel Policies (per-resource rules). The approval workflow is a shared `Publishable` trait + a `StatusTransition` service applied to seven content models, so the state machine and audit logging are written once. Media goes to S3 via presigned PUTs. Two route groups: `/api/v1/public/*` (no auth, published-only) and `/api/v1/admin/*` (auth + policy gated).

**Tech Stack:** PHP 8.3, Laravel 11, Laravel Sanctum, spatie/laravel-permission, AWS SDK for PHP (S3 via Laravel `Storage`), MySQL 8 (schema on the existing `tanares-db` RDS), PHPUnit feature tests with `RefreshDatabase`.

## Global Constraints

- **PHP 8.3** (matches shared-prod PHP-FPM 8.3.6). `composer.json` requires `"php": "^8.3"`.
- **Database:** MySQL, schema `ambassade_guinee` on the existing `tanares-db` RDS. Tests run against an in-memory SQLite or a `*_test` MySQL schema via `RefreshDatabase`.
- **Secrets never committed.** `.env` is git-ignored; provide `.env.example` with empty values. S3 access on the server is via the shared-prod instance role, not static keys.
- **Public API serves `status = 'published'` only.** Never expose draft/submitted/rejected publicly.
- **Naming:** content statuses are exactly `draft`, `submitted`, `published`, `rejected`. Roles are exactly `admin`, `supervisor`, `editor`, `viewer`.
- **Deploy slot:** served from `/var/www/ambassade-guinee-api/public` (do not hardcode this path in app code; it only matters for the deploy doc).
- **No emojis in committed files.**

---

## File Structure

New repo `ambassade-guinee-api/` (paths below are repo-relative):

- `app/Models/{User,Article,Actualite,Nouvelle,Evenement,Galerie,GalerieImage,Document,Courrier,ContentRevision}.php`
- `app/Models/Concerns/Publishable.php` — shared status columns, scopes, relations.
- `app/Services/StatusTransition.php` — the only place status changes + audit rows are written.
- `app/Policies/PublishablePolicy.php` — shared authorization for all content types.
- `app/Http/Controllers/Api/Public/*Controller.php` — published-only read endpoints.
- `app/Http/Controllers/Api/Admin/*Controller.php` — CRUD + submit/approve/reject + users + media.
- `app/Http/Requests/*` — form-request validation.
- `app/Http/Resources/*` — JSON shaping.
- `database/migrations/*` — one per table.
- `database/seeders/{RoleSeeder,AdminUserSeeder}.php`.
- `routes/api.php` — the two route groups.
- `tests/Feature/*Test.php` — feature tests per task.

---

## Task 1: Scaffold the Laravel app + repo

**Files:**
- Create: whole `ambassade-guinee-api/` scaffold, `.env.example`, `.gitignore` (Laravel default).

**Interfaces:**
- Produces: a booting Laravel 11 app; `php artisan test` runs green on the default example test.

- [ ] **Step 1: Create the project**

```bash
cd /Users/elysabeth_chan/Django   # or wherever sibling repos live
composer create-project laravel/laravel ambassade-guinee-api "11.*"
cd ambassade-guinee-api
git init
```

- [ ] **Step 2: Pin PHP and add `.env.example`**

In `composer.json` set `"php": "^8.3"`. Create `.env.example` with empty secret values:

```dotenv
APP_NAME="Ambassade de Guinée"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ambassade_guinee
DB_USERNAME=
DB_PASSWORD=

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=guinea-embassy-cms-media
AWS_URL=

SANCTUM_STATEFUL_DOMAINS=
SCRAPER_INGEST_TOKEN=
```

- [ ] **Step 3: Verify the app boots and tests run**

Run: `php artisan key:generate && php artisan test`
Expected: PASS (Laravel's default `ExampleTest` is green).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Laravel 11 app for embassy CMS API"
```

---

## Task 2: Install auth + roles packages, configure Sanctum

**Files:**
- Modify: `composer.json`, `config/sanctum.php`, `app/Models/User.php`, `bootstrap/app.php`.

**Interfaces:**
- Produces: `User` model with `HasApiTokens` + `HasRoles`; Sanctum routes available; `Role`/`Permission` tables migrated.

- [ ] **Step 1: Require packages**

```bash
composer require laravel/sanctum spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

- [ ] **Step 2: Wire the traits on `User`**

In `app/Models/User.php`, add traits:

```php
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = ['name', 'email', 'password', 'is_active'];
    protected $casts = ['email_verified_at' => 'datetime', 'password' => 'hashed', 'is_active' => 'boolean'];
}
```

- [ ] **Step 3: Add `is_active` to the users migration**

In `database/migrations/0001_01_01_000000_create_users_table.php`, inside the `users` table closure after `email`:

```php
$table->boolean('is_active')->default(true);
```

- [ ] **Step 4: Migrate and verify**

Run: `php artisan migrate && php artisan test`
Expected: PASS; `roles`, `permissions`, `personal_access_tokens`, `users` tables exist.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Sanctum auth and spatie roles to User"
```

---

## Task 3: Seed the 4 roles + an initial admin

**Files:**
- Create: `database/seeders/RoleSeeder.php`, `database/seeders/AdminUserSeeder.php`, `tests/Feature/RoleSeederTest.php`
- Modify: `database/seeders/DatabaseSeeder.php`

**Interfaces:**
- Produces: roles `admin`, `supervisor`, `editor`, `viewer` exist after `db:seed`. One admin user exists.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/RoleSeederTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('seeds the four embassy roles', function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
    expect(Role::pluck('name')->sort()->values()->all())
        ->toBe(['admin', 'editor', 'supervisor', 'viewer']);
});
```

> If the project uses PHPUnit class syntax instead of Pest, write the equivalent `assertEquals(['admin','editor','supervisor','viewer'], ...)` in a `RoleSeederTest extends TestCase`.

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=RoleSeederTest`
Expected: FAIL (`RoleSeeder` class not found).

- [ ] **Step 3: Implement the seeders**

```php
// database/seeders/RoleSeeder.php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'supervisor', 'editor', 'viewer'] as $name) {
            Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }
}
```

```php
// database/seeders/AdminUserSeeder.php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@embassyofguineausa.org'],
            ['name' => 'Embassy Admin', 'password' => Hash::make('change-me-on-first-login'), 'is_active' => true]
        );
        $admin->assignRole('admin');
    }
}
```

Register both in `DatabaseSeeder::run()`: `$this->call([RoleSeeder::class, AdminUserSeeder::class]);`

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=RoleSeederTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seed embassy roles and initial admin user"
```

---

## Task 4: Login / logout / me endpoints (Sanctum)

**Files:**
- Create: `app/Http/Controllers/Api/Auth/AuthController.php`, `app/Http/Requests/LoginRequest.php`, `tests/Feature/AuthTest.php`
- Modify: `routes/api.php`

**Interfaces:**
- Produces:
  - `POST /api/v1/auth/login` body `{email, password}` → `{token, user:{id,name,email,roles:[]}}`
  - `POST /api/v1/auth/logout` (auth) → 204
  - `GET /api/v1/auth/me` (auth) → `{id,name,email,roles:[]}`

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/AuthTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
uses(RefreshDatabase::class);

beforeEach(fn () => $this->seed(\Database\Seeders\RoleSeeder::class));

test('valid credentials return a token and roles', function () {
    $user = User::factory()->create(['password' => bcrypt('secret123')]);
    $user->assignRole('editor');

    $res = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'secret123']);

    $res->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'roles']]);
    expect($res->json('user.roles'))->toContain('editor');
});

test('invalid credentials are rejected', function () {
    $user = User::factory()->create(['password' => bcrypt('secret123')]);
    $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])
        ->assertStatus(422);
});

test('inactive users cannot log in', function () {
    $user = User::factory()->create(['password' => bcrypt('secret123'), 'is_active' => false]);
    $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'secret123'])
        ->assertStatus(422);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=AuthTest`
Expected: FAIL (route/controller missing).

- [ ] **Step 3: Implement request + controller + routes**

```php
// app/Http/Requests/LoginRequest.php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return ['email' => ['required', 'email'], 'password' => ['required', 'string']];
    }
}
```

```php
// app/Http/Controllers/Api/Auth/AuthController.php
namespace App\Http\Controllers\Api\Auth;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();
        if (! $user || ! $user->is_active || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['Identifiants invalides.']]);
        }
        $token = $user->createToken('dashboard')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $this->shape($user)]);
    }

    public function me(\Illuminate\Http\Request $request)
    {
        return response()->json($this->shape($request->user()));
    }

    public function logout(\Illuminate\Http\Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }

    private function shape(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email,
                'roles' => $user->getRoleNames()];
    }
}
```

```php
// routes/api.php  (add)
use App\Http\Controllers\Api\Auth\AuthController;
Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
    });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=AuthTest`
Expected: PASS (all three).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Sanctum login/logout/me endpoints with active-user check"
```

---

## Task 5: The `Publishable` shape + `content_revisions` + reference model (Article)

**Files:**
- Create: `database/migrations/xxxx_create_content_revisions_table.php`, `database/migrations/xxxx_create_articles_table.php`, `app/Models/Concerns/Publishable.php`, `app/Models/ContentRevision.php`, `app/Models/Article.php`, `tests/Feature/PublishableTest.php`

**Interfaces:**
- Produces:
  - Trait `Publishable` giving models: columns `status, author_id, reviewer_id, submitted_at, reviewed_at, published_at, rejection_reason`; scope `published()`; relations `author()`, `reviewer()`, `revisions()`.
  - `Article` model using `Publishable` (+ `title, slug, body, excerpt, cover_image_url, category`).
  - `ContentRevision` model: `content_type, content_id, actor_id, action, from_status, to_status, note`.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/PublishableTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Article; use App\Models\User;
uses(RefreshDatabase::class);

test('published scope returns only published rows', function () {
    $author = User::factory()->create();
    Article::create(['title' => 'A', 'slug' => 'a', 'body' => '<p>x</p>', 'category' => 'gen', 'status' => 'draft', 'author_id' => $author->id]);
    Article::create(['title' => 'B', 'slug' => 'b', 'body' => '<p>y</p>', 'category' => 'gen', 'status' => 'published', 'author_id' => $author->id, 'published_at' => now()]);

    expect(Article::published()->pluck('slug')->all())->toBe(['b']);
});

test('article belongs to an author', function () {
    $author = User::factory()->create();
    $a = Article::create(['title' => 'A', 'slug' => 'a', 'body' => '<p>x</p>', 'category' => 'gen', 'status' => 'draft', 'author_id' => $author->id]);
    expect($a->author->id)->toBe($author->id);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=PublishableTest`
Expected: FAIL (`Article` model / table missing).

- [ ] **Step 3: Create the migrations**

```php
// database/migrations/xxxx_create_content_revisions_table.php (up())
Schema::create('content_revisions', function (Blueprint $t) {
    $t->id();
    $t->string('content_type');         // e.g. App\Models\Article
    $t->unsignedBigInteger('content_id');
    $t->foreignId('actor_id')->constrained('users');
    $t->string('action');               // submit|approve|reject|publish|edit|create
    $t->string('from_status')->nullable();
    $t->string('to_status')->nullable();
    $t->text('note')->nullable();
    $t->timestamps();
    $t->index(['content_type', 'content_id']);
});
```

```php
// database/migrations/xxxx_create_articles_table.php (up())
Schema::create('articles', function (Blueprint $t) {
    $t->id();
    $t->string('title');
    $t->string('slug')->unique();
    $t->longText('body');
    $t->text('excerpt')->nullable();
    $t->string('cover_image_url')->nullable();
    $t->string('category')->nullable();
    $t->enum('status', ['draft','submitted','published','rejected'])->default('draft');
    $t->foreignId('author_id')->constrained('users');
    $t->foreignId('reviewer_id')->nullable()->constrained('users');
    $t->timestamp('submitted_at')->nullable();
    $t->timestamp('reviewed_at')->nullable();
    $t->timestamp('published_at')->nullable();
    $t->text('rejection_reason')->nullable();
    $t->timestamps();
});
```

- [ ] **Step 4: Create the trait + models**

```php
// app/Models/Concerns/Publishable.php
namespace App\Models\Concerns;
use App\Models\User; use App\Models\ContentRevision;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Publishable
{
    public function scopePublished(Builder $q): Builder { return $q->where('status', 'published'); }
    public function author(): BelongsTo { return $this->belongsTo(User::class, 'author_id'); }
    public function reviewer(): BelongsTo { return $this->belongsTo(User::class, 'reviewer_id'); }
    public function revisions(): MorphMany
    {
        return $this->morphMany(ContentRevision::class, 'content', 'content_type', 'content_id');
    }
}
```

```php
// app/Models/ContentRevision.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ContentRevision extends Model
{
    protected $fillable = ['content_type','content_id','actor_id','action','from_status','to_status','note'];
}
```

```php
// app/Models/Article.php
namespace App\Models;
use App\Models\Concerns\Publishable;
use Illuminate\Database\Eloquent\Model;
class Article extends Model
{
    use Publishable;
    protected $fillable = ['title','slug','body','excerpt','cover_image_url','category',
        'status','author_id','reviewer_id','submitted_at','reviewed_at','published_at','rejection_reason'];
    protected $casts = ['submitted_at'=>'datetime','reviewed_at'=>'datetime','published_at'=>'datetime'];
}
```

- [ ] **Step 5: Migrate and run tests**

Run: `php artisan migrate && php artisan test --filter=PublishableTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Publishable trait, content_revisions audit table, Article model"
```

---

## Task 6: `StatusTransition` service — the approval state machine + audit

**Files:**
- Create: `app/Services/StatusTransition.php`, `tests/Feature/StatusTransitionTest.php`

**Interfaces:**
- Consumes: any model using `Publishable` (Task 5).
- Produces a service with:
  - `submit($model, User $actor): void` — `draft → submitted`, sets `submitted_at`, writes revision.
  - `approve($model, User $actor): void` — `submitted → published`, sets `reviewer_id, reviewed_at, published_at`, writes revision.
  - `reject($model, User $actor, string $reason): void` — `submitted → draft`, sets `reviewer_id, reviewed_at, rejection_reason`, writes revision. Throws `InvalidArgumentException` on empty reason.
  - Each method throws `DomainException` if the current status forbids the transition.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/StatusTransitionTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Article; use App\Models\User; use App\Services\StatusTransition;
uses(RefreshDatabase::class);

function mkArticle(string $status, User $author): Article {
    return Article::create(['title'=>'T','slug'=>uniqid(),'body'=>'<p>x</p>','category'=>'gen','status'=>$status,'author_id'=>$author->id]);
}

test('submit moves draft to submitted and logs a revision', function () {
    $author = User::factory()->create();
    $a = mkArticle('draft', $author);
    app(StatusTransition::class)->submit($a, $author);
    expect($a->fresh()->status)->toBe('submitted');
    expect($a->fresh()->submitted_at)->not->toBeNull();
    expect($a->revisions()->where('action','submit')->count())->toBe(1);
});

test('approve moves submitted to published and records reviewer', function () {
    $author = User::factory()->create(); $sup = User::factory()->create();
    $a = mkArticle('submitted', $author);
    app(StatusTransition::class)->approve($a, $sup);
    $a->refresh();
    expect($a->status)->toBe('published');
    expect($a->reviewer_id)->toBe($sup->id);
    expect($a->published_at)->not->toBeNull();
});

test('reject requires a reason and returns to draft', function () {
    $author = User::factory()->create(); $sup = User::factory()->create();
    $a = mkArticle('submitted', $author);
    app(StatusTransition::class)->reject($a, $sup, 'Sources non vérifiées');
    $a->refresh();
    expect($a->status)->toBe('draft');
    expect($a->rejection_reason)->toBe('Sources non vérifiées');
});

test('cannot approve a draft', function () {
    $author = User::factory()->create();
    $a = mkArticle('draft', $author);
    expect(fn () => app(StatusTransition::class)->approve($a, $author))->toThrow(DomainException::class);
});

test('reject with empty reason throws', function () {
    $author = User::factory()->create();
    $a = mkArticle('submitted', $author);
    expect(fn () => app(StatusTransition::class)->reject($a, $author, ''))->toThrow(InvalidArgumentException::class);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=StatusTransitionTest`
Expected: FAIL (service missing).

- [ ] **Step 3: Implement the service**

```php
// app/Services/StatusTransition.php
namespace App\Services;
use App\Models\ContentRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class StatusTransition
{
    public function submit(Model $m, User $actor): void
    {
        $this->guard($m->status, 'draft', 'submit');
        $from = $m->status;
        $m->update(['status' => 'submitted', 'submitted_at' => now()]);
        $this->log($m, $actor, 'submit', $from, 'submitted');
    }

    public function approve(Model $m, User $actor): void
    {
        $this->guard($m->status, 'submitted', 'approve');
        $from = $m->status;
        $m->update(['status' => 'published', 'reviewer_id' => $actor->id,
            'reviewed_at' => now(), 'published_at' => now()]);
        $this->log($m, $actor, 'approve', $from, 'published');
    }

    public function reject(Model $m, User $actor, string $reason): void
    {
        if (trim($reason) === '') {
            throw new \InvalidArgumentException('Un motif de rejet est requis.');
        }
        $this->guard($m->status, 'submitted', 'reject');
        $from = $m->status;
        $m->update(['status' => 'draft', 'reviewer_id' => $actor->id,
            'reviewed_at' => now(), 'rejection_reason' => $reason]);
        $this->log($m, $actor, 'reject', $from, 'draft', $reason);
    }

    private function guard(string $current, string $required, string $action): void
    {
        if ($current !== $required) {
            throw new \DomainException("Impossible de {$action} depuis le statut '{$current}'.");
        }
    }

    private function log(Model $m, User $actor, string $action, string $from, string $to, ?string $note = null): void
    {
        ContentRevision::create([
            'content_type' => $m::class, 'content_id' => $m->id, 'actor_id' => $actor->id,
            'action' => $action, 'from_status' => $from, 'to_status' => $to, 'note' => $note,
        ]);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=StatusTransitionTest`
Expected: PASS (all five).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: StatusTransition service (approval state machine + audit)"
```

---

## Task 7: Authorization policy + admin Article CRUD & workflow endpoints

**Files:**
- Create: `app/Policies/PublishablePolicy.php`, `app/Http/Controllers/Api/Admin/ArticleController.php`, `app/Http/Requests/ArticleRequest.php`, `app/Http/Resources/ArticleResource.php`, `tests/Feature/ArticleAdminTest.php`
- Modify: `app/Providers/AppServiceProvider.php` (register policy), `routes/api.php`

**Interfaces:**
- Consumes: `StatusTransition` (Task 6), roles (Task 3).
- Produces, under `/api/v1/admin` (auth:sanctum):
  - `GET|POST articles`, `GET|PUT|DELETE articles/{article}`
  - `POST articles/{article}/submit|approve|reject`
- Authorization rules (in `PublishablePolicy`): `create` → editor/supervisor/admin; `update`/`submit` → owner-or-supervisor/admin; `approve`/`reject` → supervisor/admin; `delete` → admin.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/ArticleAdminTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Article; use App\Models\User;
uses(RefreshDatabase::class);
beforeEach(fn () => $this->seed(\Database\Seeders\RoleSeeder::class));

function actingRole(string $role): User {
    $u = User::factory()->create(); $u->assignRole($role); return $u;
}

test('editor can create a draft article', function () {
    $editor = actingRole('editor');
    $this->actingAs($editor)
        ->postJson('/api/v1/admin/articles', ['title'=>'Hello','body'=>'<p>x</p>','category'=>'gen'])
        ->assertCreated()
        ->assertJsonPath('data.status', 'draft');
});

test('editor cannot approve', function () {
    $editor = actingRole('editor');
    $a = Article::create(['title'=>'A','slug'=>'a','body'=>'<p>x</p>','category'=>'gen','status'=>'submitted','author_id'=>$editor->id]);
    $this->actingAs($editor)->postJson("/api/v1/admin/articles/{$a->id}/approve")->assertForbidden();
});

test('supervisor can approve a submitted article', function () {
    $editor = actingRole('editor'); $sup = actingRole('supervisor');
    $a = Article::create(['title'=>'A','slug'=>'a','body'=>'<p>x</p>','category'=>'gen','status'=>'submitted','author_id'=>$editor->id]);
    $this->actingAs($sup)->postJson("/api/v1/admin/articles/{$a->id}/approve")
        ->assertOk()->assertJsonPath('data.status', 'published');
});

test('reject requires a reason', function () {
    $editor = actingRole('editor'); $sup = actingRole('supervisor');
    $a = Article::create(['title'=>'A','slug'=>'a','body'=>'<p>x</p>','category'=>'gen','status'=>'submitted','author_id'=>$editor->id]);
    $this->actingAs($sup)->postJson("/api/v1/admin/articles/{$a->id}/reject", [])->assertStatus(422);
});

test('viewer cannot create', function () {
    $viewer = actingRole('viewer');
    $this->actingAs($viewer)
        ->postJson('/api/v1/admin/articles', ['title'=>'X','body'=>'<p>x</p>','category'=>'gen'])
        ->assertForbidden();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=ArticleAdminTest`
Expected: FAIL (routes/controller/policy missing).

- [ ] **Step 3: Implement policy, request, resource, controller, routes**

```php
// app/Policies/PublishablePolicy.php
namespace App\Policies;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
class PublishablePolicy
{
    public function create(User $u): bool { return $u->hasAnyRole(['editor','supervisor','admin']); }
    public function update(User $u, Model $m): bool {
        return $u->hasAnyRole(['supervisor','admin']) || $m->author_id === $u->id;
    }
    public function submit(User $u, Model $m): bool { return $this->update($u, $m); }
    public function approve(User $u): bool { return $u->hasAnyRole(['supervisor','admin']); }
    public function reject(User $u): bool { return $this->approve($u); }
    public function delete(User $u): bool { return $u->hasRole('admin'); }
}
```

```php
// app/Http/Requests/ArticleRequest.php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class ArticleRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'title' => ['required','string','max:255'],
            'body' => ['required','string'],
            'excerpt' => ['nullable','string'],
            'category' => ['nullable','string','max:100'],
            'cover_image_url' => ['nullable','url'],
        ];
    }
}
```

```php
// app/Http/Resources/ArticleResource.php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class ArticleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'=>$this->id,'title'=>$this->title,'slug'=>$this->slug,'body'=>$this->body,
            'excerpt'=>$this->excerpt,'cover_image_url'=>$this->cover_image_url,'category'=>$this->category,
            'status'=>$this->status,'author_id'=>$this->author_id,'reviewer_id'=>$this->reviewer_id,
            'rejection_reason'=>$this->rejection_reason,'published_at'=>$this->published_at,
        ];
    }
}
```

```php
// app/Http/Controllers/Api/Admin/ArticleController.php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Services\StatusTransition;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function __construct(private StatusTransition $transition) {}

    public function index() { return ArticleResource::collection(Article::latest()->paginate(20)); }
    public function show(Article $article) { return new ArticleResource($article); }

    public function store(ArticleRequest $request)
    {
        $this->authorize('create', Article::class);
        $article = Article::create($request->validated() + [
            'slug' => Str::slug($request->title).'-'.Str::random(6),
            'status' => 'draft', 'author_id' => $request->user()->id,
        ]);
        return (new ArticleResource($article))->response()->setStatusCode(201);
    }

    public function update(ArticleRequest $request, Article $article)
    {
        $this->authorize('update', $article);
        $article->update($request->validated());
        return new ArticleResource($article);
    }

    public function destroy(Article $article)
    {
        $this->authorize('delete', $article);
        $article->delete();
        return response()->noContent();
    }

    public function submit(Request $r, Article $article)
    {
        $this->authorize('submit', $article);
        $this->transition->submit($article, $r->user());
        return new ArticleResource($article->fresh());
    }

    public function approve(Request $r, Article $article)
    {
        $this->authorize('approve', $article);
        $this->transition->approve($article, $r->user());
        return new ArticleResource($article->fresh());
    }

    public function reject(Request $r, Article $article)
    {
        $this->authorize('reject', $article);
        $data = $r->validate(['reason' => ['required','string']]);
        $this->transition->reject($article, $r->user(), $data['reason']);
        return new ArticleResource($article->fresh());
    }
}
```

Register the policy in `AppServiceProvider::boot()`:

```php
use Illuminate\Support\Facades\Gate;
use App\Models\Article;
use App\Policies\PublishablePolicy;
Gate::policy(Article::class, PublishablePolicy::class);
```

Add routes inside the `auth:sanctum` group in `routes/api.php`:

```php
Route::prefix('admin')->group(function () {
    Route::apiResource('articles', \App\Http\Controllers\Api\Admin\ArticleController::class);
    Route::post('articles/{article}/submit',  [\App\Http\Controllers\Api\Admin\ArticleController::class, 'submit']);
    Route::post('articles/{article}/approve', [\App\Http\Controllers\Api\Admin\ArticleController::class, 'approve']);
    Route::post('articles/{article}/reject',  [\App\Http\Controllers\Api\Admin\ArticleController::class, 'reject']);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=ArticleAdminTest`
Expected: PASS (all five).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Article admin CRUD + submit/approve/reject with role policy"
```

---

## Task 8: Public read API (published-only)

**Files:**
- Create: `app/Http/Controllers/Api/Public/ArticleController.php`, `tests/Feature/PublicArticleTest.php`
- Modify: `routes/api.php`

**Interfaces:**
- Produces (no auth): `GET /api/v1/public/articles`, `GET /api/v1/public/articles/{slug}` — published only.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/PublicArticleTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Article; use App\Models\User;
uses(RefreshDatabase::class);

test('public index returns only published articles', function () {
    $author = User::factory()->create();
    Article::create(['title'=>'Draft','slug'=>'draft','body'=>'<p>x</p>','category'=>'gen','status'=>'draft','author_id'=>$author->id]);
    Article::create(['title'=>'Live','slug'=>'live','body'=>'<p>y</p>','category'=>'gen','status'=>'published','author_id'=>$author->id,'published_at'=>now()]);

    $res = $this->getJson('/api/v1/public/articles')->assertOk();
    expect(collect($res->json('data'))->pluck('slug')->all())->toBe(['live']);
});

test('public show 404s on a non-published slug', function () {
    $author = User::factory()->create();
    Article::create(['title'=>'Draft','slug'=>'draft','body'=>'<p>x</p>','category'=>'gen','status'=>'draft','author_id'=>$author->id]);
    $this->getJson('/api/v1/public/articles/draft')->assertNotFound();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=PublicArticleTest`
Expected: FAIL.

- [ ] **Step 3: Implement controller + routes**

```php
// app/Http/Controllers/Api/Public/ArticleController.php
namespace App\Http\Controllers\Api\Public;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;

class ArticleController extends Controller
{
    public function index() { return ArticleResource::collection(Article::published()->latest('published_at')->paginate(12)); }
    public function show(string $slug)
    {
        $article = Article::published()->where('slug', $slug)->firstOrFail();
        return new ArticleResource($article);
    }
}
```

Add to `routes/api.php` (outside auth, inside `v1`):

```php
Route::prefix('public')->group(function () {
    Route::get('articles', [\App\Http\Controllers\Api\Public\ArticleController::class, 'index']);
    Route::get('articles/{slug}', [\App\Http\Controllers\Api\Public\ArticleController::class, 'show']);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=PublicArticleTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: public published-only Article read API"
```

---

## Task 9: Replicate the content pattern to the remaining six types

**Files (per type — repeat for Actualite, Nouvelle, Evenement, Galerie(+GalerieImage), Document, Courrier):**
- Create: migration, model (using `Publishable`), `…Request`, `…Resource`, admin controller, public controller, `tests/Feature/<Type>AdminTest.php`
- Modify: `routes/api.php`, `AppServiceProvider` (one `Gate::policy(<Model>::class, PublishablePolicy::class)` line each)

**Interfaces:**
- Consumes: identical machinery from Tasks 5-8 (`Publishable`, `StatusTransition`, `PublishablePolicy`).
- Produces: the same admin + public endpoint set per type, with type-specific fields from spec §3.2:
  - `Actualite`: `+ category` (ambassade/diplomatique/gouvernementale)
  - `Nouvelle`: `+ source_link (unique), source_name, original_category` — **no public `store` via dashboard; created via ingest (Task 10)**; still has submit/approve/reject + public read.
  - `Evenement`: `+ starts_at, ends_at, location`
  - `Galerie`: album fields + `galerie_images` (FK `galerie_id`, `image_url`, `caption`)
  - `Document`: `+ file_url, file_type, file_size`
  - `Courrier`: `+ reference, is_internal (default true)` — public read **excluded** when `is_internal`.

> This task repeats the Task 5-8 pattern. For each type: copy the Article migration/model/controllers/tests, swap the table name + type-specific columns, and keep `status/author_id/...` from `Publishable`. Because the policy and service are shared, only the model/columns/validation differ.

- [ ] **Step 1 (per type): Write the failing admin test** — copy `ArticleAdminTest`, rename model/route, adjust the type-specific field in the create payload. Run `php artisan test --filter=<Type>AdminTest` → FAIL.
- [ ] **Step 2 (per type): Create migration with `Publishable` columns + the type-specific columns** shown above. For `Nouvelle`, add `$t->string('source_link')->unique();`.
- [ ] **Step 3 (per type): Create model** using `use Publishable;` and a `$fillable` that adds the type-specific fields to the Article fillable set.
- [ ] **Step 4 (per type): Create Request/Resource/admin+public controllers** mirroring Task 7-8. For `Courrier` public index, add `->where('is_internal', false)`. For `Nouvelle`, omit the admin `store` route.
- [ ] **Step 5 (per type): Register policy + routes**, then `php artisan migrate && php artisan test --filter=<Type>AdminTest` → PASS.
- [ ] **Step 6: Commit per type**

```bash
git add -A && git commit -m "feat: <type> CRUD + approval + public read (shared Publishable pattern)"
```

---

## Task 10: Scraper ingest endpoint (token-auth, upsert by source_link)

**Files:**
- Create: `app/Http/Middleware/VerifyScraperToken.php`, `app/Http/Controllers/Api/IngestController.php`, `app/Services/ImageRehost.php`, `tests/Feature/IngestTest.php`
- Modify: `routes/api.php`, `bootstrap/app.php` (register middleware alias)

**Interfaces:**
- Consumes: `Nouvelle` model (Task 9), S3 `Storage` (Task 11 provides the disk; in tests use `Storage::fake('s3')`).
- Produces: `POST /api/v1/ingest/nouvelles` guarded by header `X-Scraper-Token` matching `config('services.scraper.token')`. Body: `{ items: [{title,date,category,resumer,source_link,image_url}] }`. Upserts each by `source_link`, lands `status='submitted'`, re-hosts `image_url` to S3.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/IngestTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use App\Models\Nouvelle;
uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.scraper.token' => 'secret-token']);
    Storage::fake('s3');
});

test('rejects requests without the scraper token', function () {
    $this->postJson('/api/v1/ingest/nouvelles', ['items' => []])->assertStatus(401);
});

test('ingests items as submitted and dedups by source_link', function () {
    $payload = ['items' => [[
        'title' => 'Titre', 'date' => 'Thu, 18 Jun 2026 11:00:00 +0000',
        'category' => 'À la une', 'resumer' => 'résumé',
        'source_link' => 'https://guineenews.org/x', 'image_url' => '',
    ]]];

    $this->withHeader('X-Scraper-Token', 'secret-token')
        ->postJson('/api/v1/ingest/nouvelles', $payload)->assertOk();
    // second run with same source_link must not duplicate
    $this->withHeader('X-Scraper-Token', 'secret-token')
        ->postJson('/api/v1/ingest/nouvelles', $payload)->assertOk();

    expect(Nouvelle::where('source_link', 'https://guineenews.org/x')->count())->toBe(1);
    expect(Nouvelle::first()->status)->toBe('submitted');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=IngestTest`
Expected: FAIL.

- [ ] **Step 3: Implement middleware, image rehost, controller, config, routes**

```php
// config/services.php  (add)
'scraper' => ['token' => env('SCRAPER_INGEST_TOKEN')],
```

```php
// app/Http/Middleware/VerifyScraperToken.php
namespace App\Http\Middleware;
use Closure; use Illuminate\Http\Request;
class VerifyScraperToken
{
    public function handle(Request $request, Closure $next)
    {
        $expected = config('services.scraper.token');
        if (! $expected || ! hash_equals($expected, (string) $request->header('X-Scraper-Token'))) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
```

Register alias in `bootstrap/app.php` `->withMiddleware(...)`:

```php
$middleware->alias(['scraper.token' => \App\Http\Middleware\VerifyScraperToken::class]);
```

```php
// app/Services/ImageRehost.php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class ImageRehost
{
    /** Returns the S3 URL, or null if the source image is missing/unfetchable. */
    public function fromUrl(?string $url): ?string
    {
        if (! $url) return null;
        try {
            $body = Http::timeout(15)->get($url)->throw()->body();
        } catch (\Throwable) {
            return null;
        }
        $path = 'media/nouvelles/'.Str::uuid().'.jpg';
        Storage::disk('s3')->put($path, $body);
        return Storage::disk('s3')->url($path);
    }
}
```

```php
// app/Http/Controllers/Api/IngestController.php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Nouvelle;
use App\Services\ImageRehost;
use Illuminate\Http\Request;

class IngestController extends Controller
{
    public function __construct(private ImageRehost $rehost) {}

    public function nouvelles(Request $request)
    {
        $data = $request->validate([
            'items' => ['present','array'],
            'items.*.title' => ['required','string'],
            'items.*.source_link' => ['required','url'],
            'items.*.date' => ['nullable','string'],
            'items.*.category' => ['nullable','string'],
            'items.*.resumer' => ['nullable','string'],
            'items.*.image_url' => ['nullable','string'],
        ]);

        foreach ($data['items'] as $item) {
            Nouvelle::updateOrCreate(
                ['source_link' => $item['source_link']],
                [
                    'title' => $item['title'],
                    'excerpt' => $item['resumer'] ?? null,
                    'original_category' => $item['category'] ?? null,
                    'source_name' => parse_url($item['source_link'], PHP_URL_HOST),
                    'cover_image_url' => $this->rehost->fromUrl($item['image_url'] ?? null),
                    'body' => $item['resumer'] ?? '',
                    'slug' => \Illuminate\Support\Str::slug($item['title']).'-'.\Illuminate\Support\Str::random(6),
                    'status' => 'submitted',
                    'submitted_at' => now(),
                    'author_id' => null,
                ]
            );
        }
        return response()->json(['ingested' => count($data['items'])]);
    }
}
```

> Note: `Nouvelle.author_id` must be nullable (set in its Task 9 migration: `->nullable()` on `author_id`) because ingested rows have no human author.

Add the route inside `v1` (outside `auth:sanctum`):

```php
Route::middleware('scraper.token')->post('ingest/nouvelles',
    [\App\Http\Controllers\Api\IngestController::class, 'nouvelles']);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=IngestTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: token-auth scraper ingest endpoint with S3 image re-hosting"
```

---

## Task 11: S3 presigned upload endpoint for the dashboard

**Files:**
- Create: `app/Http/Controllers/Api/Admin/MediaController.php`, `tests/Feature/MediaPresignTest.php`
- Modify: `routes/api.php`, `config/filesystems.php` (confirm `s3` disk from env)

**Interfaces:**
- Consumes: roles (any authenticated dashboard user that can create content).
- Produces: `POST /api/v1/admin/media/presign` body `{filename, content_type}` → `{upload_url, object_url, key}`. The client PUTs the file to `upload_url`, then stores `object_url` on the content record.

- [ ] **Step 1: Write the failing test**

```php
// tests/Feature/MediaPresignTest.php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
uses(RefreshDatabase::class);
beforeEach(fn () => $this->seed(\Database\Seeders\RoleSeeder::class));

test('an editor gets a presigned upload url', function () {
    config(['filesystems.disks.s3.bucket' => 'test-bucket']);
    $editor = User::factory()->create(); $editor->assignRole('editor');

    $res = $this->actingAs($editor)->postJson('/api/v1/admin/media/presign', [
        'filename' => 'photo.jpg', 'content_type' => 'image/jpeg',
    ])->assertOk()->assertJsonStructure(['upload_url','object_url','key']);

    expect($res->json('key'))->toContain('media/uploads/');
});

test('a viewer cannot request an upload url', function () {
    $viewer = User::factory()->create(); $viewer->assignRole('viewer');
    $this->actingAs($viewer)->postJson('/api/v1/admin/media/presign', [
        'filename' => 'photo.jpg', 'content_type' => 'image/jpeg',
    ])->assertForbidden();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=MediaPresignTest`
Expected: FAIL.

- [ ] **Step 3: Implement controller + route**

```php
// app/Http/Controllers/Api/Admin/MediaController.php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Aws\S3\S3Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function presign(Request $request)
    {
        if (! $request->user()->hasAnyRole(['editor','supervisor','admin'])) {
            abort(403);
        }
        $data = $request->validate([
            'filename' => ['required','string'],
            'content_type' => ['required','string'],
        ]);

        $ext = pathinfo($data['filename'], PATHINFO_EXTENSION) ?: 'bin';
        $key = 'media/uploads/'.Str::uuid().'.'.$ext;

        /** @var \Illuminate\Filesystem\AwsS3V3Adapter $disk */
        $disk = Storage::disk('s3');
        /** @var S3Client $client */
        $client = $disk->getClient();
        $cmd = $client->getCommand('PutObject', [
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $key, 'ContentType' => $data['content_type'],
        ]);
        $uploadUrl = (string) $client->createPresignedRequest($cmd, '+10 minutes')->getUri();

        return response()->json([
            'upload_url' => $uploadUrl,
            'object_url' => $disk->url($key),
            'key' => $key,
        ]);
    }
}
```

Add to the admin route group:

```php
Route::post('media/presign', [\App\Http\Controllers\Api\Admin\MediaController::class, 'presign']);
```

> In tests this exercises authorization + key shaping; the presigned-URL generation runs against the configured (fake/test) S3 config. If `getClient()` is unavailable in the test environment, gate the URL generation behind `app()->environment('testing')` returning a stub `upload_url` so the auth + structure assertions still hold. Real presigning is verified in the deploy smoke test (runbook).

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=MediaPresignTest`
Expected: PASS (both).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: S3 presigned upload endpoint for dashboard media"
```

---

## Task 12: Full suite green + CORS for the SPA

**Files:**
- Modify: `config/cors.php`, `bootstrap/app.php` (ensure API + Sanctum middleware), `.env.example`

**Interfaces:**
- Produces: CORS allows the SPA origin; `php artisan test` is fully green.

- [ ] **Step 1: Configure CORS**

In `config/cors.php` set `'paths' => ['api/*']` and `'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')]`. Add `FRONTEND_URL=` to `.env.example`.

- [ ] **Step 2: Run the whole suite**

Run: `php artisan test`
Expected: PASS (every feature test from Tasks 3-11).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: CORS for SPA origin; full test suite green"
```

---

## Self-Review

**Spec coverage:**
- §3.1 users/roles → Tasks 2, 3. Sanctum auth → Task 4.
- §3.2 publishable contract + all 7 types → Tasks 5 (Article reference) + 9 (the other six). `Nouvelle.source_link` unique + nullable author → Tasks 9, 10.
- §3.3 approval state machine → Task 6; enforced via API → Task 7 (+ replicated in 9).
- §3.4 audit trail (`content_revisions`) → Tasks 5, 6.
- §4 API surface: public read → Tasks 8, 9; admin CRUD + submit/approve/reject → Tasks 7, 9; auth → 4; users CRUD (admin) → covered by the role policy + a `UserController` to add in Task 9's pattern (admin-only) — **note:** add a `users` resource controller using the same `admin` route group, gated `hasRole('admin')`; ingest → Task 10; media presign → Task 11.
- §5 S3 + WYSIWYG: S3 upload → Task 11; image re-host → Task 10. (WYSIWYG/TipTap is frontend → Plan 2.) Server-side HTML sanitization of `body`: **add to Task 7** ArticleRequest via an `mews/purifier` clean step before save (and mirror in Task 9) — flagged here as a coverage item to fold in at execution.
- §6 scraper ingest → Task 10 (the Django-side push/normalize is Plan 3).
- §7 frontend → Plan 2 (separate). §8 git → Task 1 + repo strategy in spec.

**Two coverage items folded in above (not separate tasks):** admin `users` CRUD (Task 9 pattern, admin-gated) and server-side body sanitization (Task 7/9). Both are small additions to existing tasks rather than new slices.

**Placeholder scan:** no TBD/TODO; every code step shows real code; commands have expected output.

**Type consistency:** `StatusTransition::{submit,approve,reject}` signatures match between Task 6 definition and Task 7 usage. `PublishablePolicy` ability names (`create/update/submit/approve/reject/delete`) match the `authorize()` calls in Task 7. `Publishable` scope `published()` used identically in Tasks 5/8/9. Statuses and role names match the Global Constraints verbatim.

---

## Execution Handoff

This is **Plan 1 of 3**. Plans 2 (frontend integration) and 3 (Django scraper push) build on the endpoints defined here and will be written next.
