import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Ambil user yang sudah ada
	const users = await prisma.user.findMany({
		orderBy: { id: "asc" },
	});

	if (users.length < 2) {
		console.log("❌ Not enough users to seed follows");
		return;
	}

	await prisma.following.createMany({
		data: [
			{
				followerId: users[0].id,
				followingId: users[1].id,
			},
			{
				followerId: users[0].id,
				followingId: users[2]?.id ?? users[1].id,
			},
			{
				followerId: users[1].id,
				followingId: users[0].id,
			},
		],
		skipDuplicates: true,
	});

	console.log("✅ Follow seeding success");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
