-- ============================================================
-- Nettoyage des données de test
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE llx_payment_salary;
TRUNCATE TABLE llx_salary;
DELETE FROM llx_user WHERE ref_employee IN ('1','2','3');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1) EMPLOYES (llx_user)
-- ============================================================

INSERT INTO llx_user (login, lastname, pass, gender, ref_employee, employee, entity, datec)
VALUES ('rakoto1', 'Rakotobe', 'hImsghv2pqC0', 'man', '1', 1, 1, NOW());
SET @id_employe1 = LAST_INSERT_ID();

INSERT INTO llx_user (login, lastname, pass, gender, ref_employee, employee, entity, datec)
VALUES ('rasoa1', 'Rasoabe', 'hImsghv2pqC0', 'woman', '2', 1, 1, NOW());
SET @id_employe2 = LAST_INSERT_ID();

INSERT INTO llx_user (login, lastname, pass, gender, ref_employee, employee, entity, datec)
VALUES ('rajao1', 'Rajao', 'hImsghv2pqC0', 'man', '3', 1, 1, NOW());
SET @id_employe3 = LAST_INSERT_ID();

-- ============================================================
-- 2) SALAIRES (llx_salary)
-- ============================================================

INSERT INTO llx_salary (entity, ref, fk_user, amount, salary, label, datesp, dateep, datec, fk_user_author, fk_typepayment, paye)
VALUES (1, '1', @id_employe1, 890.00, 890.00, 'Salaire', '2026-03-01', '2026-03-08', NOW(), 1, 2, 0);
SET @id_salaire1 = LAST_INSERT_ID();

INSERT INTO llx_salary (entity, ref, fk_user, amount, salary, label, datesp, dateep, datec, fk_user_author, fk_typepayment, paye)
VALUES (1, '2', @id_employe1, 780.00, 780.00, 'Salaire', '2026-03-02', '2026-04-04', NOW(), 1, 2, 0);
SET @id_salaire2 = LAST_INSERT_ID();

INSERT INTO llx_salary (entity, ref, fk_user, amount, salary, label, datesp, dateep, datec, fk_user_author, fk_typepayment, paye)
VALUES (1, '3', @id_employe1, 500.00, 500.00, 'Salaire', '2026-05-02', '2026-05-14', NOW(), 1, 2, 0);
SET @id_salaire3 = LAST_INSERT_ID();

INSERT INTO llx_salary (entity, ref, fk_user, amount, salary, label, datesp, dateep, datec, fk_user_author, fk_typepayment, paye)
VALUES (1, '4', @id_employe2, 677.56, 677.56, 'Salaire', '2026-03-01', '2026-03-08', NOW(), 1, 2, 0);
SET @id_salaire4 = LAST_INSERT_ID();

-- ============================================================
-- 3) PAIEMENTS (llx_payment_salary)
-- ============================================================

INSERT INTO llx_payment_salary (entity, fk_salary, datec, datep, amount, fk_typepayment, fk_user_author)
VALUES (1, @id_salaire1, NOW(), '2026-03-08', 890.00, 2, 1);

INSERT INTO llx_payment_salary (entity, fk_salary, datec, datep, amount, fk_typepayment, fk_user_author)
VALUES (1, @id_salaire2, NOW(), '2026-03-08', 480.00, 2, 1);

INSERT INTO llx_payment_salary (entity, fk_salary, datec, datep, amount, fk_typepayment, fk_user_author)
VALUES (1, @id_salaire2, NOW(), '2026-03-08', 300.00, 2, 1);

INSERT INTO llx_payment_salary (entity, fk_salary, datec, datep, amount, fk_typepayment, fk_user_author)
VALUES (1, @id_salaire3, NOW(), '2026-05-08', 200.00, 2, 1);

-- Le salaire 4 n'a aucun paiement.