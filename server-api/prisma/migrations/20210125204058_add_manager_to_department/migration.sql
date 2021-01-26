-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Department" ADD FOREIGN KEY("managerId")REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
