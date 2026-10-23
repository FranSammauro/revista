-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ALUMNO', 'PROFESOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('BORRADOR', 'EN_REVISION', 'PUBLICADO', 'RECHAZADO', 'POSPUESTO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('REGISTRO_USUARIO', 'VERIFICACION_EMAIL', 'LOGIN', 'LOGIN_FALLIDO', 'CAMBIO_PASSWORD', 'ACCESO_TEMPORAL_PROFESOR', 'ARTICULO_ENVIADO_REVISION', 'ARTICULO_APROBADO', 'ARTICULO_RECHAZADO', 'ARTICULO_POSPUESTO', 'COMENTARIO_CREADO', 'COMENTARIO_MODERADO', 'COMENTARIO_BORRADO', 'USUARIO_SUSPENDIDO', 'USUARIO_REACTIVADO', 'WHITELIST_PROFESOR_AGREGADO', 'WHITELIST_PROFESOR_QUITADO');

-- CreateEnum
CREATE TYPE "EmailTokenPurpose" AS ENUM ('VERIFICACION_REGISTRO', 'RECUPERACION_PASSWORD');

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_accounts" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_whitelist_entries" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "displayName" TEXT,
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_whitelist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_identities" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_accesses" (
    "id" TEXT NOT NULL,
    "teacherIdentityId" TEXT NOT NULL,
    "subjectAccountId" TEXT NOT NULL,
    "whitelistEntryId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ALUMNO',
    "isInstitutional" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "suspendedUntil" TIMESTAMP(3),
    "suspendReason" TEXT,
    "registrationIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_tokens" (
    "id" TEXT NOT NULL,
    "purpose" "EmailTokenPurpose" NOT NULL,
    "userId" TEXT,
    "teacherIdentityId" TEXT,
    "code" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverColor" TEXT NOT NULL,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ArticleStatus" NOT NULL DEFAULT 'BORRADOR',
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "reviewComment" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "body" TEXT NOT NULL,
    "isCensored" BOOLEAN NOT NULL DEFAULT false,
    "censoredBy" TEXT,
    "censoredAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorUserId" TEXT,
    "actorTeacherIdentityId" TEXT,
    "actingAsSubjectUsername" TEXT,
    "targetUserId" TEXT,
    "targetArticleId" TEXT,
    "targetCommentId" TEXT,
    "ip" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subject_accounts_subjectId_key" ON "subject_accounts"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_accounts_username_key" ON "subject_accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_whitelist_entries_email_subjectId_key" ON "teacher_whitelist_entries"("email", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_identities_email_key" ON "teacher_identities"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_accesses_token_key" ON "teacher_accesses"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "subject_accounts" ADD CONSTRAINT "subject_accounts_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_whitelist_entries" ADD CONSTRAINT "teacher_whitelist_entries_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_accesses" ADD CONSTRAINT "teacher_accesses_teacherIdentityId_fkey" FOREIGN KEY ("teacherIdentityId") REFERENCES "teacher_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_accesses" ADD CONSTRAINT "teacher_accesses_subjectAccountId_fkey" FOREIGN KEY ("subjectAccountId") REFERENCES "subject_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_accesses" ADD CONSTRAINT "teacher_accesses_whitelistEntryId_fkey" FOREIGN KEY ("whitelistEntryId") REFERENCES "teacher_whitelist_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tokens" ADD CONSTRAINT "email_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tokens" ADD CONSTRAINT "email_tokens_teacherIdentityId_fkey" FOREIGN KEY ("teacherIdentityId") REFERENCES "teacher_identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorTeacherIdentityId_fkey" FOREIGN KEY ("actorTeacherIdentityId") REFERENCES "teacher_identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
