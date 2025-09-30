const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clean up existing data
  await prisma.alert.deleteMany();
  await prisma.moodReport.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  
  // Create a sample user (counselor)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'counselor@university.edu',
      name: 'Dr. Eleanor Vance',
      password: hashedPassword,
      role: 'COUNSELOR',
    },
  });
  console.log(`Created user: ${user.name}`);

  // Create courses
  const course1 = await prisma.course.create({
    data: {
      courseCode: 'CS101',
      title: 'Introduction to Computer Science',
    },
  });
  const course2 = await prisma.course.create({
    data: {
      courseCode: 'MATH203',
      title: 'Advanced Calculus',
    },
  });
  console.log(`Created courses: ${course1.title}, ${course2.title}`);

  // Create students
  const student1 = await prisma.student.create({
    data: {
      studentId: 'S001',
      name: 'Alice Johnson',
      email: 'alice.j@university.edu',
      enrollmentDate: new Date('2023-09-01'),
      courses: {
        connect: [{ id: course1.id }, { id: course2.id }],
      },
    },
  });

  const student2 = await prisma.student.create({
    data: {
      studentId: 'S002',
      name: 'Bob Williams',
      email: 'bob.w@university.edu',
      enrollmentDate: new Date('2023-09-01'),
      courses: {
        connect: [{ id: course1.id }],
      },
    },
  });
  console.log(`Created students: ${student1.name}, ${student2.name}`);

  // Create assignments
  const assignment1_cs = await prisma.assignment.create({
    data: {
      title: 'CS101 - Midterm Project',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
      maxScore: 100,
      courseId: course1.id,
    },
  });

  const assignment2_cs = await prisma.assignment.create({
    data: {
      title: 'CS101 - Final Essay',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
      maxScore: 100,
      courseId: course1.id,
    },
  });

   const assignment1_math = await prisma.assignment.create({
    data: {
      title: 'MATH203 - Problem Set 1',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 15)), // 15 days ago
      maxScore: 100,
      courseId: course2.id,
    },
  });
  console.log('Created assignments.');


  // Create submissions for Alice (at-risk student)
  // Simulating declining performance and lateness
  await prisma.submission.create({
    data: {
      studentId: student1.id,
      assignmentId: assignment1_math.id,
      submittedAt: new Date(new Date(assignment1_math.dueDate).setDate(assignment1_math.dueDate.getDate() + 1)), // 1 day late
      grade: 75,
    },
  });

   await prisma.submission.create({
    data: {
      studentId: student1.id,
      assignmentId: assignment1_cs.id,
      submittedAt: new Date(new Date(assignment1_cs.dueDate).setDate(assignment1_cs.dueDate.getDate() + 5)), // 5 days late
      grade: 58,
    },
  });
  
  // Create submissions for Bob (stable student)
  await prisma.submission.create({
    data: {
      studentId: student2.id,
      assignmentId: assignment1_cs.id,
      submittedAt: new Date(new Date(assignment1_cs.dueDate).setDate(assignment1_cs.dueDate.getDate() - 1)), // Submitted early
      grade: 92,
    },
  });
  console.log('Created submissions.');
  
  // Create an alert for Alice based on a mock risk score
  await prisma.alert.create({
      data: {
          studentId: student1.id,
          riskScore: 0.78,
          reason: "Significant drop in grades and increasing submission delays detected."
      }
  })
  console.log('Created a sample alert.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
