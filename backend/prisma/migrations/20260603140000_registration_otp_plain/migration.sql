-- Replace hashed OTP storage with a short-lived plain OTP visible for verification workflows.
ALTER TABLE "RegistrationOtp" ADD COLUMN "otp" TEXT;

UPDATE "RegistrationOtp" SET "otp" = '000000' WHERE "otp" IS NULL;

ALTER TABLE "RegistrationOtp" ALTER COLUMN "otp" SET NOT NULL;
ALTER TABLE "RegistrationOtp" DROP COLUMN "otpHash";
