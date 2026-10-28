export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'scenario'
  | 'identify-threat'
  | 'match-pairs'
  | 'arrange-steps'
  | 'choose-safest'
  | 'multi-step';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  levelId: number;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  takeaway: string;
  scenario?: string;
  hint?: string;
}

export interface LevelDef {
  id: number;
  title: string;
  topic: string;
  description: string;
  baseDifficulty: Difficulty;
  icon: string;
  color: string;
}

export const LEVELS: LevelDef[] = [
  { id: 1, title: 'Digital Detective', topic: 'Digital awareness fundamentals', description: 'Recognize safe and unsafe online behavior.', baseDifficulty: 'easy', icon: '🕵️', color: 'cyan' },
  { id: 2, title: 'Phishing Hunter', topic: 'Phishing and suspicious messages', description: 'Spot fake emails, URLs, and urgent scams.', baseDifficulty: 'easy', icon: '🎣', color: 'blue' },
  { id: 3, title: 'Password Guardian', topic: 'Password security and authentication', description: 'Strong passwords, managers, and MFA.', baseDifficulty: 'easy', icon: '🔐', color: 'purple' },
  { id: 4, title: 'Privacy Protector', topic: 'Online privacy and personal information', description: 'Keep private info private.', baseDifficulty: 'medium', icon: '🛡️', color: 'indigo' },
  { id: 5, title: 'Social Media Survival', topic: 'Social engineering and online interactions', description: 'Suspicious requests and oversharing.', baseDifficulty: 'medium', icon: '👥', color: 'pink' },
  { id: 6, title: 'Scam Buster', topic: 'Online scams and fraudulent offers', description: 'Detect fake giveaways and shady deals.', baseDifficulty: 'medium', icon: '🚨', color: 'red' },
  { id: 7, title: 'Wi-Fi Watchtower', topic: 'Network security', description: 'Safer networks and encrypted connections.', baseDifficulty: 'medium', icon: '📡', color: 'teal' },
  { id: 8, title: 'Malware Maze', topic: 'Malware, ransomware, and malicious downloads', description: 'Risky downloads and attachments.', baseDifficulty: 'medium', icon: '🦠', color: 'green' },
  { id: 9, title: 'Digital Footprint Tracker', topic: 'Digital footprints and online reputation', description: 'Traces you leave behind.', baseDifficulty: 'medium', icon: '👣', color: 'amber' },
  { id: 10, title: 'AI Deepfake Detective', topic: 'AI-generated misinformation and deepfakes', description: 'Spot manipulated media.', baseDifficulty: 'hard', icon: '🤖', color: 'violet' },
  { id: 11, title: 'Cyberbullying Response Team', topic: 'Cyberbullying and digital responsibility', description: 'Respond to harassment safely.', baseDifficulty: 'hard', icon: '🤝', color: 'rose' },
  { id: 12, title: 'Identity Theft Investigation', topic: 'Identity theft and account compromise', description: 'Account takeover warning signs.', baseDifficulty: 'hard', icon: '🕵️‍♀️', color: 'orange' },
  { id: 13, title: 'Data Breach Emergency', topic: 'Data breaches and incident response', description: 'Respond to breaches fast.', baseDifficulty: 'hard', icon: '🔥', color: 'red' },
  { id: 14, title: 'Cybersecurity Incident Commander', topic: 'Advanced security decisions', description: 'Multi-step security scenarios.', baseDifficulty: 'hard', icon: '🧠', color: 'cyan' },
  { id: 15, title: 'The Ultimate CyberQuest', topic: 'Comprehensive digital awareness', description: 'Final mission across all topics.', baseDifficulty: 'expert', icon: '🏆', color: 'yellow' },
];

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
  expert: 40,
};

export const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard', 'Expert'] as const;
