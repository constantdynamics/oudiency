/**
 * Gestructureerde context per AI-taak. De echte provider gebruikt de prompt; de DemoProvider
 * kiest op basis van deze context passende, vooraf geschreven fragmenten.
 */

export interface DemoHistoryItem {
  role: 'user' | 'figure';
  text: string;
}

export interface LectureCandidate {
  id: string;
  name: string;
  tags: string[];
}

export type DemoContext =
  | {
      kind: 'session-opening';
      figureId: string;
      sessionId: string;
      displayName: string;
      topicHint?: string;
      /** Onderwerpen of samenvattingen van eerdere sessies met deze denker. */
      memory: string[];
    }
  | {
      kind: 'session-turn';
      figureId: string;
      sessionId: string;
      displayName: string;
      turn: number;
      remainingMs: number;
      userText: string;
      topicHint?: string;
      history: DemoHistoryItem[];
      crisis: boolean;
    }
  | {
      kind: 'session-summary';
      figureId: string;
      sessionId: string;
      history: DemoHistoryItem[];
      topicHint?: string;
    }
  | {
      kind: 'lecture-plan';
      figureId: string;
      lectureId: string;
      topic: string;
      mainQuestion: string;
    }
  | {
      kind: 'lecture-segment';
      figureId: string;
      lectureId: string;
      topic: string;
      mainQuestion: string;
      segmentKind: 'opening' | 'deel' | 'antwoord' | 'conclusie';
      /** 0 = opening, 1–3 = delen, 4 = conclusie. */
      partIndex: number;
      heading: string;
      question?: string;
      /** Ids van de lesblokken die de demo voor dit college koos (via het plan). */
      blockIds?: string[];
    }
  | {
      kind: 'timeline-reactions';
      postId: string;
      text: string;
      candidates: LectureCandidate[];
      /** Max. één nog niet ontdekte denker mag reageren. */
      undiscovered: string[];
      allowDiscovery: boolean;
    }
  | { kind: 'moderation'; text: string }
  | { kind: 'helper'; query: string; candidates: LectureCandidate[] }
  | { kind: 'thought'; figureId: string; dateKey: string }
  | { kind: 'daily-question'; figureId: string; questionId: string; question: string }
  | { kind: 'test' };
