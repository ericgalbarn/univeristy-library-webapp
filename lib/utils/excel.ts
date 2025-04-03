import { Workbook } from "exceljs";
import { users } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>;

export const generateUsersExcel = async (users: User[]) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Users");

  // Add headers
  worksheet.columns = [
    { header: "Full Name", key: "fullName", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "University ID", key: "universityId", width: 15 },
    { header: "Role", key: "role", width: 10 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "createAt", width: 20 },
    { header: "Last Active", key: "lastActivityDate", width: 20 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  users.forEach((user) => {
    worksheet.addRow({
      fullName: user.fullName,
      email: user.email,
      universityId: user.universityId,
      role: user.role,
      status: user.status,
      createAt: user.createAt
        ? new Date(user.createAt).toLocaleString()
        : "N/A",
      lastActivityDate: user.lastActivityDate
        ? new Date(user.lastActivityDate).toLocaleString()
        : "N/A",
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
