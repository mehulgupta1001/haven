/**
 * Russell Group members plus major University of London federation colleges
 * (deduplicated — many appear in both groups).
 */
export type UniversityBadge = 'russell' | 'uol';

export type UkFocusUniversity = {
  id: string;
  name: string;
  badges: UniversityBadge[];
};

export const UK_FOCUS_UNIVERSITIES: UkFocusUniversity[] = [
  { id: 'birmingham', name: 'University of Birmingham', badges: ['russell'] },
  { id: 'birkbeck', name: 'Birkbeck, University of London', badges: ['uol'] },
  { id: 'bristol', name: 'University of Bristol', badges: ['russell'] },
  { id: 'cambridge', name: 'University of Cambridge', badges: ['russell'] },
  { id: 'cardiff', name: 'Cardiff University', badges: ['russell'] },
  { id: 'city', name: 'City St George’s, University of London', badges: ['uol'] },
  { id: 'durham', name: 'Durham University', badges: ['russell'] },
  { id: 'edinburgh', name: 'The University of Edinburgh', badges: ['russell'] },
  { id: 'exeter', name: 'University of Exeter', badges: ['russell'] },
  { id: 'glasgow', name: 'University of Glasgow', badges: ['russell'] },
  { id: 'goldsmiths', name: 'Goldsmiths, University of London', badges: ['uol'] },
  { id: 'icl', name: 'Imperial College London', badges: ['russell'] },
  { id: 'kcl', name: "King's College London", badges: ['russell', 'uol'] },
  { id: 'leeds', name: 'University of Leeds', badges: ['russell'] },
  { id: 'liverpool', name: 'University of Liverpool', badges: ['russell'] },
  { id: 'lse', name: 'London School of Economics and Political Science', badges: ['russell', 'uol'] },
  { id: 'manchester', name: 'The University of Manchester', badges: ['russell'] },
  { id: 'newcastle', name: 'Newcastle University', badges: ['russell'] },
  { id: 'nottingham', name: 'University of Nottingham', badges: ['russell'] },
  { id: 'oxford', name: 'University of Oxford', badges: ['russell'] },
  { id: 'qmul', name: 'Queen Mary University of London', badges: ['russell', 'uol'] },
  { id: 'queens-belfast', name: "Queen's University Belfast", badges: ['russell'] },
  { id: 'rhul', name: 'Royal Holloway, University of London', badges: ['uol'] },
  { id: 'sheffield', name: 'The University of Sheffield', badges: ['russell'] },
  { id: 'soas', name: 'SOAS University of London', badges: ['uol'] },
  { id: 'southampton', name: 'University of Southampton', badges: ['russell'] },
  { id: 'st-georges', name: "St George's, University of London", badges: ['uol'] },
  { id: 'ucl', name: 'University College London', badges: ['russell', 'uol'] },
  { id: 'warwick', name: 'University of Warwick', badges: ['russell'] },
  { id: 'york', name: 'University of York', badges: ['russell'] },
];
