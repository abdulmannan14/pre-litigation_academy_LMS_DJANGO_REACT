export const mockUser = {
  id: 1,
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  role: 'student',
  avatar: null,
};

export const mockAdmin = {
  id: 99,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

export const mockCourses = [
  {
    id: 1,
    title: 'Pre-Litigation Case Management Fundamentals',
    description:
      'Master the essential skills for managing pre-litigation cases effectively. Learn how to gather evidence, communicate with clients, and build a strong case foundation.',
    thumbnail: null,
    totalLessons: 9,
    totalDuration: '4h 30m',
    modules: [
      {
        id: 1,
        title: 'Introduction to Pre-Litigation',
        order: 1,
        lessons: [
          {
            id: 1,
            title: 'What is Pre-Litigation?',
            description:
              'Understand the pre-litigation phase and its importance in legal proceedings. This lesson covers the basics of what happens before a case goes to trial.',
            duration: '12:30',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 1,
          },
          {
            id: 2,
            title: 'Key Stakeholders in a Case',
            description:
              'Learn about the different parties involved in a pre-litigation case, including clients, opposing counsel, insurance companies, and witnesses.',
            duration: '15:45',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 2,
          },
          {
            id: 3,
            title: 'Timeline and Deadlines',
            description:
              'Critical dates and statutes of limitations you must track during the pre-litigation phase to protect your client\'s rights.',
            duration: '18:20',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 3,
          },
        ],
      },
      {
        id: 2,
        title: 'Evidence Collection & Documentation',
        order: 2,
        lessons: [
          {
            id: 4,
            title: 'Gathering Medical Records',
            description:
              'Step-by-step process for obtaining and organizing medical records, including how to request records and what to look for.',
            duration: '22:10',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 1,
          },
          {
            id: 5,
            title: 'Photographing Evidence',
            description:
              'Best practices for documenting physical evidence through photography, including accident scenes, injuries, and property damage.',
            duration: '14:55',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 2,
          },
          {
            id: 6,
            title: 'Witness Statements',
            description:
              'How to properly gather, record, and preserve witness statements that will hold up during litigation if needed.',
            duration: '19:30',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 3,
          },
        ],
      },
      {
        id: 3,
        title: 'Client Communication & Negotiation',
        order: 3,
        lessons: [
          {
            id: 7,
            title: 'Setting Client Expectations',
            description:
              'Learn how to communicate realistically with clients about timelines, outcomes, and the pre-litigation process.',
            duration: '16:40',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 1,
          },
          {
            id: 8,
            title: 'Demand Letters',
            description:
              'How to draft effective demand letters that clearly communicate your client\'s position and set the stage for settlement negotiations.',
            duration: '25:15',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 2,
          },
          {
            id: 9,
            title: 'Settlement Negotiations',
            description:
              'Strategies and tactics for negotiating favorable settlements before litigation, saving time and resources for all parties.',
            duration: '28:00',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            order: 3,
          },
        ],
      },
    ],
  },
];

export const mockQuizzes = {
  1: {
    lessonId: 1,
    questions: [
      {
        id: 1,
        text: 'What does "pre-litigation" refer to in legal terms?',
        options: [
          'The period after a trial verdict is reached',
          'The period before a formal lawsuit is filed',
          'The process of filing court documents',
          'The appeals process after a judgment',
        ],
        correctAnswer: 1,
        explanation:
          'Pre-litigation refers to the period and activities that occur before a formal lawsuit is filed in court.',
      },
      {
        id: 2,
        text: 'Which of the following is NOT typically a goal of the pre-litigation phase?',
        options: [
          'Gathering evidence to support the claim',
          'Attempting to reach a settlement',
          'Filing the case with the court',
          'Documenting the client\'s damages',
        ],
        correctAnswer: 2,
        explanation:
          'Filing the case with the court marks the beginning of litigation, not the pre-litigation phase.',
      },
      {
        id: 3,
        text: 'Why is the pre-litigation phase important for case outcomes?',
        options: [
          'It allows attorneys to avoid any court appearances',
          'Strong pre-litigation work can lead to better settlements and trial outcomes',
          'It eliminates the need for evidence collection',
          'It guarantees a favorable verdict',
        ],
        correctAnswer: 1,
        explanation:
          'Thorough pre-litigation preparation strengthens your case position, often leading to better settlements and, if needed, stronger trial performance.',
      },
    ],
  },
  2: {
    lessonId: 2,
    questions: [
      {
        id: 1,
        text: 'Which party is responsible for defending against a claim in pre-litigation?',
        options: [
          'The plaintiff\'s attorney',
          'The insurance adjuster or defense counsel',
          'The court clerk',
          'The mediator',
        ],
        correctAnswer: 1,
        explanation:
          'In pre-litigation, the insurance adjuster or defense counsel represents the opposing party.',
      },
      {
        id: 2,
        text: 'What role do expert witnesses play in pre-litigation?',
        options: [
          'They file the lawsuit on behalf of the client',
          'They provide specialized knowledge that supports the case',
          'They negotiate directly with the judge',
          'They have no role until trial',
        ],
        correctAnswer: 1,
        explanation:
          'Expert witnesses provide specialized knowledge that can strengthen the case during pre-litigation negotiations.',
      },
    ],
  },
  3: {
    lessonId: 3,
    questions: [
      {
        id: 1,
        text: 'What is a statute of limitations?',
        options: [
          'A limit on how much compensation can be awarded',
          'The maximum number of witnesses allowed in a case',
          'The deadline by which a lawsuit must be filed',
          'A restriction on attorney fees',
        ],
        correctAnswer: 2,
        explanation:
          'A statute of limitations is the legal deadline by which a lawsuit must be filed or the right to sue is lost.',
      },
      {
        id: 2,
        text: 'What happens if a statute of limitations expires?',
        options: [
          'The case is automatically settled',
          'The client loses the right to file a lawsuit',
          'The case moves to arbitration',
          'The attorney must pay a fine',
        ],
        correctAnswer: 1,
        explanation:
          'If the statute of limitations expires, the client typically loses the legal right to file a lawsuit for that claim.',
      },
      {
        id: 3,
        text: 'Which tool is most effective for tracking case deadlines?',
        options: [
          'A handwritten notepad',
          'A case management software with calendar alerts',
          'Memory alone',
          'A basic email reminder',
        ],
        correctAnswer: 1,
        explanation:
          'Case management software with automated calendar alerts is the most reliable way to track multiple deadlines across many cases.',
      },
    ],
  },
};

export const mockProgress = {
  courseId: 1,
  completedLessons: [1, 2],
  quizScores: {
    1: { score: 3, total: 3, passed: true },
    2: { score: 1, total: 2, passed: true },
  },
  lastLessonId: 3,
  videoPositions: {
    1: 650,
    2: 900,
    3: 120,
  },
};
