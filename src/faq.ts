export interface FaqEntry {
  question: string;
  answer: string;
}

export const VCAA_URL = 'https://f10.vcaa.vic.edu.au/';

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'What curriculum is Maths Map based on?',
    answer:
      'The Victorian Curriculum F–10 (Version 2.0) Mathematics, published by the Victorian Curriculum and Assessment Authority (VCAA), Australia. This version covers Level 1 (about Year 1). Source of truth: f10.vcaa.vic.edu.au — always check there for the official, current document.',
  },
  {
    question: 'Is this for parents outside Victoria?',
    answer:
      'Maths Map is built and checked against the Victorian document. Other Australian states and territories derive their curriculum from ACARA’s Australian Curriculum, so much overlaps — but codes, level names and achievement standards are Victorian. Outside Victoria, treat it as a maths check-in, not an official alignment to your state’s expectations.',
  },
  {
    question: 'Is Maths Map a test or diagnostic assessment?',
    answer:
      'No. It is a parent-guided check-in mapped to the Victorian Curriculum’s Level 1 content descriptions. It is not NAPLAN, not a validated diagnostic, not marked by psychometricians, and not a judgement of your child’s potential. Use it to spot gaps and celebrate growth; use the school for the official picture.',
  },
  {
    question: "Is my child's data private?",
    answer:
      'Yes. Profiles, answers and history are stored only on your device (browser local storage). There are no accounts, no servers collecting results, no analytics, no ads. Use ⬇️ Backup in the footer regularly — clearing browser data erases everything otherwise.',
  },
  {
    question: 'Do I need an account, and does it cost anything?',
    answer:
      'No account, no cost. Maths Map is a static web app you can use in any modern browser, install to your home screen, and use offline. It is non-commercial; VCAA curriculum content is included under CC-BY-NC 3.0 for non-commercial use only.',
  },
  {
    question: 'How were the questions written? Can I trust them?',
    answer:
      'Every item maps to an official VCAA content description code (e.g. VC2M1N04 — add and subtract within 20). Wording and activities are original, written by a parent from the VCAA content descriptions and elaborations — they have not been peer-reviewed by educators or psychometricians, and item difficulty is our best estimate until play-tested in your home.',
  },
  {
    question: 'Can I print a report for parent–teacher night?',
    answer:
      'Yes — tap 🖨️ Print on your child’s home screen. The A4 report shows the achievement standard, strand scores, every content code with its status, strengths and suggested focus areas, all labelled with the VCAA codes your teacher will recognise.',
  },
  {
    question: 'My child struggles with most topics. What should I do?',
    answer:
      'Please talk to your child’s teacher — and use the check-in report as the conversation-starter. Broad struggles can have many causes (vision, hearing, attention, anxiety, language). Your teacher sees the whole year; you see the kitchen table. Together that is the full picture. If in doubt, your GP can screen the basics.',
  },
  {
    question: 'Does it cover other year levels?',
    answer:
      'Level 1 today, by design — doing one level well beats ten levels poorly. The curriculum data covers the full F–10 range, so more levels can be added later using the same approach (and the VCAA source).',
  },
  {
    question: 'Licence and attribution?',
    answer:
      'Curriculum content, codes and elaborations are © VCAA, licensed CC-BY-NC 3.0 Australia (f10.vcaa.vic.edu.au) — non-commercial use with attribution. Maths Map itself is shared freely for non-commercial family and personal learning; it may not be used commercially, and it is not affiliated with or endorsed by VCAA, ACARA or any school.',
  },
  {
    question: 'Found a mistake or have a suggestion?',
    answer:
      'Please open an issue on the GitHub repository (codergarten/maths-map) — parents helping parents is exactly how this improves. Be kind; it is a family project.',
  },
];
