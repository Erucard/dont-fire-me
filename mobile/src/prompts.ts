// Every prompt is an incoming email the player must answer.
// Edit freely — keep each id unique. cat: excuse | announce | request | replyall

export type ThreadMsg = { from: string; text: string };
export type Prompt = {
  id: string;
  cat: 'excuse' | 'announce' | 'request' | 'replyall';
  from: string;
  subject: string;
  body?: string;
  thread?: ThreadMsg[];
  task: string;
};

export const PROMPTS: Prompt[] = [
  // ---- EXCUSE EMAILS (HR wants answers) ----
  { id: 'ex1', cat: 'excuse', from: 'HR <hr@corp.biz>', subject: 'Incident Report: Break Room', body: 'It has come to our attention that you microwaved fish in the shared break room. Again.\n\nPlease respond with an explanation for the record.', task: 'Explain yourself. Admit nothing.' },
  { id: 'ex2', cat: 'excuse', from: 'Facilities <keys@corp.biz>', subject: 'RE: The office plant', body: 'The plant assigned to your care (Gerald, Ficus, 3rd floor) has been declared dead by two independent auditors.\n\nAwaiting your statement.', task: 'Explain how this is actually a win for the company.' },
  { id: 'ex3', cat: 'excuse', from: 'Your Manager <boss@corp.biz>', subject: 'Quick question', body: 'You left at 2:47 PM on Tuesday for a "quick coffee run."\n\nYou returned Thursday.', task: 'Account for the missing 43 hours. Professionally.' },
  { id: 'ex4', cat: 'excuse', from: 'IT Security <it@corp.biz>', subject: 'Password audit findings', body: 'Our audit shows your password has been "password" for six consecutive years. It is also written on a sticky note visible in your LinkedIn profile photo.', task: 'Respond in a way that keeps your laptop privileges.' },
  { id: 'ex5', cat: 'excuse', from: 'Finance <expenses@corp.biz>', subject: 'Expense report — item 12', body: 'Your Q2 expense report includes $340 categorized as "emotional support snacks."\n\nPlease justify this line item.', task: 'Defend the snacks. Every single one.' },
  { id: 'ex6', cat: 'excuse', from: 'Your Manager <boss@corp.biz>', subject: "This morning's stand-up", body: 'You fell asleep during the 9 AM stand-up meeting.\n\nWhile standing.\n\nWhile presenting.', task: 'Explain why this demonstrates commitment.' },
  { id: 'ex7', cat: 'excuse', from: 'HR <hr@corp.biz>', subject: 'Your out-of-office reply', body: 'Your automatic reply says "back Monday!" It has said this since March. It is now September. You have responded to emails during this period, but only to forward memes.', task: 'Clarify your availability. Vaguely.' },
  { id: 'ex8', cat: 'excuse', from: 'Office Admin <admin@corp.biz>', subject: 'Printer usage report', body: 'The color printer logs show you printed 200 pages labeled "meme_archive_FINAL_v7." The toner budget is now exhausted until Q4.', task: 'Frame this as an investment in company culture.' },
  { id: 'ex9', cat: 'excuse', from: 'Security <lobby@corp.biz>', subject: 'Parking violation', body: "Camera footage shows your electric scooter parked in the CEO's reserved spot for the past two weeks. A small cone has been placed on it.", task: 'Respond. The scooter stays.' },
  { id: 'ex10', cat: 'excuse', from: 'HR <hr@corp.biz>', subject: 'RE: All-hands invitation', body: 'You replied to the company-wide quarterly all-hands calendar invitation with the message "lol k."\n\nThe CEO has seen it.', task: 'Walk it back without apologizing.' },
  // ---- ABSURD ANNOUNCEMENTS (management needs you to break the news) ----
  { id: 'an1', cat: 'announce', from: 'The Board <board@corp.biz>', subject: 'ACTION REQUIRED: All-staff announcement', body: 'Effective Monday, the office is a submarine. This is a cost-saving measure. Do not ask follow-up questions.\n\nDraft the all-staff announcement. Make it sound like a perk.', task: 'Announce it. Make the submarine sound like a perk.' },
  { id: 'an2', cat: 'announce', from: 'The Board <board@corp.biz>', subject: 'Re: 4th floor', body: 'The 4th floor no longer exists and must not be discussed. Employees previously on the 4th floor are fine and have always worked on the 5th.\n\nCommunicate this to all staff.', task: 'Announce it calmly. Do not raise questions about the 4th floor.' },
  { id: 'an3', cat: 'announce', from: 'M&A Team <deals@corp.biz>', subject: 'CONFIDENTIAL: merger comms', body: 'We have completed our merger with Ridgeline Holdings, which is, legally speaking, a raccoon.\n\nThe raccoon will be joining the leadership team. Draft the announcement.', task: 'Announce the merger. Emphasize cultural fit.' },
  { id: 'an4', cat: 'announce', from: 'The Board <board@corp.biz>', subject: 'New seating initiative', body: 'To promote agility, we are moving to a dynamic open-office plan.\n\nThere is one chair.\n\nAnnounce this as a wellness initiative.', task: 'One chair. Sell it as wellness.' },
  { id: 'an5', cat: 'announce', from: 'People Ops <culture@corp.biz>', subject: 'Coffee machine restructuring', body: 'Following a strong performance review, the break room coffee machine has been promoted to middle management. It will now be taking 1:1s.\n\nPlease inform staff.', task: 'Announce the promotion. Congratulate the machine.' },
  { id: 'an6', cat: 'announce', from: 'The Board <board@corp.biz>', subject: 'Relocation strategy', body: 'To reduce rent, headquarters is relocating to the moon. Commute policy is unchanged; employees are expected to adjust.\n\nDraft the announcement.', task: 'Announce the move. Address the commute concern briefly and dismissively.' },
  { id: 'an7', cat: 'announce', from: 'Compensation Committee <comp@corp.biz>', subject: 'Q4 compensation update', body: 'Effective next quarter, salaries will be paid in exposure. Early projections show exposure at an all-time high.\n\nCommunicate the excitement.', task: "Announce it like it's a raise." },
  { id: 'an8', cat: 'announce', from: 'People Ops <culture@corp.biz>', subject: 'Team retreat logistics', body: "This year's team-building retreat is a mandatory 10-day silent meditation in a cave. Phones will be composted.\n\nPlease build enthusiasm.", task: 'Announce the retreat. Build enthusiasm.' },
  { id: 'an9', cat: 'announce', from: 'Facilities <keys@corp.biz>', subject: 'Elevator monetization', body: 'The building elevator is now a subscription service ($14.99/mo, ElevatorPlus™). The stairs remain free during the promotional period.\n\nAnnounce the exciting new tiers.', task: 'Announce ElevatorPlus™. Mention the family plan.' },
  { id: 'an10', cat: 'announce', from: 'The Board <board@corp.biz>', subject: 'Dress code update', body: 'Casual Friday is now Medieval Friday. Chainmail is business casual. The moat opens at 9.\n\nInform the team.', task: 'Announce it with appropriate gravitas.' },
  // ---- TERRIBLE REQUESTS (you want something. good luck.) ----
  { id: 'rq1', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'You deleted the production database this morning. All of it.\n\nSeparately, you were planning to ask for a raise today.\n\nSend one email to your boss covering both.', task: 'Ask for the raise. Mention the database. In that order.' },
  { id: 'rq2', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'Your goldfish has passed away and the funeral is Friday.\n\nThis is the third goldfish funeral you have requested time off for this year. HR is starting to keep a chart.', task: 'Request Friday off. Address the chart.' },
  { id: 'rq3', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: "You are interviewing at your company's biggest competitor next week.\n\nYou need a reference. The best reference would be… your current CEO.", task: 'Ask the CEO to be your reference. For that job.' },
  { id: 'rq4', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'You do data entry.\n\nYou have decided your role requires access to the company jet.', task: 'Convince finance the jet is essential to data entry.' },
  { id: 'rq5', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: "You need to request permanent remote work.\n\nYou cannot specify where from. (It's prison. Do not say it's prison.)", task: 'Request permanent remote work. Location: unspecified.' },
  { id: 'rq6', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'You need a budget of $50,000 for the upcoming quarter.\n\nThe line item is "vibes." There is no further breakdown available.', task: 'Request the vibes budget. Provide no breakdown.' },
  { id: 'rq7', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'Your mom has attended your last three performance reviews. Nobody knows how she keeps getting the calendar invite.\n\nHR has asked you to handle it.', task: 'Email HR. Un-invite your mom. Gently.' },
  { id: 'rq8', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'You have run the numbers, and your entire team could be replaced by just you, if you were paid five times more.\n\nThe numbers are in your head. There is no spreadsheet.', task: 'Propose the restructure. Cite "the numbers."' },
  { id: 'rq9', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'You want a promotion to Senior Executive Visionary of Synergy.\n\nThis position does not exist. You invented it on the bus this morning.', task: 'Request the promotion. Define the role without defining it.' },
  { id: 'rq10', cat: 'request', from: 'Your Conscience <inbox@you.biz>', subject: 'You have to send this email', body: 'Your dog has been coming to the office for months. Everyone loves him.\n\nIt is time he was made official. With a title. And dental.', task: 'Request your dog be hired. Negotiate his benefits.' },
  // ---- REPLY-ALL DISASTERS (the thread is on fire. reply-all.) ----
  { id: 'ra1', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: 'Congratulations Dana — 10 years!', thread: [
    { from: 'CEO', text: 'Please join me in congratulating Dana on an incredible 10 years with the company!' },
    { from: 'Greg (Reply All)', text: 'who is dana' },
  ], task: 'Reply-all. Save Greg. Or destroy him. Your choice.' },
  { id: 'ra2', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: 'Fridge cleanout Friday', thread: [
    { from: 'HR', text: 'Friendly reminder: the office fridge will be cleaned out this Friday.' },
    { from: 'Marcus (Reply All)', text: 'WHOEVER HAS BEEN EATING MY YOGURTS WILL FACE CONSEQUENCES. I HAVE A LIST OF SUSPECTS.' },
  ], task: 'Reply-all and de-escalate. Note: you ate the yogurts.' },
  { id: 'ra3', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: 'Client meeting at 3 PM', thread: [
    { from: 'Your Boss', text: 'Team — big client meeting at 3. Need everyone sharp.' },
    { from: 'You (Reply All, meant for a friend)', text: 'ugh this meeting could 1000% have been an email 🙄🙄' },
  ], task: 'You already sent that. Everyone saw it. Write the follow-up reply-all.' },
  { id: 'ra4', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: '⚠️ SECURITY: Do not click the link', thread: [
    { from: 'IT Security', text: 'An email titled "FREE GIFT CARD CLICK NOW" is circulating. Do NOT click the link. Do not enter your credentials.' },
    { from: 'Janet (Reply All)', text: 'I clicked it. Twice. It asked for my password so I gave the backup one too, just in case.' },
  ], task: 'Reply-all with a calm, structured plan. You are not from IT.' },
  { id: 'ra5', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: '2nd floor restroom', thread: [
    { from: 'Facilities', text: 'The 2nd floor restroom is out of order until further notice.' },
    { from: 'VP of Operations (Reply All)', text: 'This is unacceptable. Someone WILL be held responsible.' },
  ], task: 'Reply-all and take full responsibility. With dignity. It was not you.' },
  { id: 'ra6', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: 'Welcome baby Kim! 🍼', thread: [
    { from: 'People Ops', text: 'Please join us in congratulating Kim on the newest member of the family!' },
    { from: 'Dave (Reply All)', text: 'Please see attached. [attachment: salary_negotiation_leverage_FINAL.xlsx]' },
  ], task: 'You are Dave. Reply-all. Explain the attachment.' },
  { id: 'ra7', cat: 'replyall', from: 'ALL-STAFF THREAD', subject: 'A message from our CEO', thread: [
    { from: 'CEO', text: "I want you all to know: we're not just a company. We're a family." },
    { from: 'Anonymous (Reply All)', text: 'families dont lay off 12% of each other' },
  ], task: 'You are middle management. Reply-all. Thread the needle.' },
];

export const JARGON: string[] = [
  'Per my last email, ', 'Circling back on this, ', "Let's take this offline. ", 'At the end of the day, ',
  'Going forward, ', 'To piggyback on that, ', 'Bandwidth permitting, ', 'From a 30,000-foot view, ',
  'we should leverage our core competencies', 'this will really move the needle', "it's low-hanging fruit, frankly",
  "let's align on next steps", "I'd love to touch base and ideate", 'this is a clear value-add', 'we must avoid boiling the ocean',
  "it's a paradigm shift", "let's operationalize the deliverables", 'per company policy', 'in the spirit of radical transparency',
  'as a thought leader in this space', 'with a growth mindset', 'synergy remains our north star', "let's double-click on that",
  'happy to hop on a quick call', "I'll action that item", "let's put a pin in it", 'moving forward holistically',
];

export const TITLES: string[] = [
  'Junior Synergy Associate', 'VP of Vibes', 'Chief Snack Officer', 'Head of Circling Back', 'Deliverables Wrangler',
  'Senior Paradigm Shifter', 'Director of Offline Conversations', 'Intern (Year 9)', 'Assistant to the Regional Manager',
  'Thought Leader II', 'Bandwidth Analyst', 'Low-Hanging Fruit Picker', 'Synergy Evangelist', 'Actioner of Items',
  'Reply-All Compliance Officer', 'Head of Touching Base',
];

export const STAR_LABELS: Record<number, string> = {
  1: 'Terminated', 2: 'PIP incoming', 3: 'Meets expectations', 4: 'Exceeds expectations', 5: 'CEO material',
};

export const CUBES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N'];
