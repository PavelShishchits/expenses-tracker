import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const systemCategories = [
  { title: "Food", icon: "utensils", iconColor: "#EF4444" },
  { title: "Transport", icon: "car", iconColor: "#3B82F6" },
  { title: "Housing", icon: "home", iconColor: "#22C55E" },
  { title: "Entertainment", icon: "film", iconColor: "#8B5CF6" },
  { title: "Health", icon: "heart", iconColor: "#EC4899" },
  { title: "Shopping", icon: "shopping-cart", iconColor: "#F97316" },
  { title: "Education", icon: "book", iconColor: "#EAB308" },
  { title: "Other", icon: "tag", iconColor: "#6B7280" },
];

async function main(): Promise<void> {
  for (const cat of systemCategories) {
    const existing = await prisma.category.findFirst({
      where: { title: cat.title, isSystem: true },
    });
    if (!existing) {
      await prisma.category.create({
        data: { ...cat, isSystem: true, accountId: null },
      });
    }
  }
  console.log("Seeded system categories");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
