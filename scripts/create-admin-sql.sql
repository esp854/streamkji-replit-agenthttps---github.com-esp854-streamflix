-- Script SQL pour créer l'utilisateur admin directement dans PostgreSQL
-- À exécuter dans l'interface Render Database ou via psql

-- Insérer ou mettre à jour l'utilisateur admin
-- Mot de passe haché pour "admin123" (bcrypt avec 10 rounds)
INSERT INTO users (username, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@streamkji.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Vérifier que l'admin a été créé
SELECT id, username, email, role, "createdAt" FROM users WHERE email = 'admin@streamkji.com';