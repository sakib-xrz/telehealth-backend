-- DropForeignKey
ALTER TABLE "madical_reports" DROP CONSTRAINT "madical_reports_patientId_fkey";

-- DropForeignKey
ALTER TABLE "patient_health_datas" DROP CONSTRAINT "patient_health_datas_patientId_fkey";

-- AddForeignKey
ALTER TABLE "patient_health_datas" ADD CONSTRAINT "patient_health_datas_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "madical_reports" ADD CONSTRAINT "madical_reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
