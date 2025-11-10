import coursesData from '../data/cs.json';

// Tag structure definition - Requirements
const requirementsStructure = {
  id: 'requirements',
  label: 'Requirements',
  children: [
    { id: 'basic-computer-sciences', label: 'Basic Computer Sciences' },
    { id: 'basic-calculus', label: 'Basic Calculus' },
    {
      id: 'additional-mathematics',
      label: 'Additional Mathematics',
      children: [
        { id: 'linear-algebra', label: 'Linear Algebra' },
        { id: 'probability-statistics', label: 'Probability or Statistics' },
      ]
    },
    {
      id: 'advanced-cs-courses',
      label: 'Advanced Computer Science Courses',
      children: [
        { id: 'theory-cs', label: 'Theory' },
        { id: 'software-hardware', label: 'Software & Hardware' },
        { id: 'applications', label: 'Applications' },
        { id: 'electives', label: 'Electives' },
      ]
    },
  ]
};

// Mapping from tag IDs to course codes (normalized to "COMP SCI XXX" format)
const tagToCoursesMap = {
  'basic-computer-sciences': [
    'COMP SCI 240',
    'COMP SCI 252',
    'COMP SCI 300',
    'COMP SCI 354',
    'COMP SCI 400',
  ],
  'theory-cs': [
    'COMP SCI 577',
    'COMP SCI 520',
  ],
  'software-hardware': [
    'COMP SCI 407',
    'COMP SCI 506',
    'COMP SCI 536',
    'COMP SCI 537',
    'COMP SCI 538',
    'COMP SCI 542',
    'COMP SCI 544',
    'COMP SCI 552',
    'COMP SCI 557',
    'COMP SCI 564',
    'COMP SCI 640',
    'COMP SCI 642',
  ],
  'applications': [
    'COMP SCI 412',
    'COMP SCI 425',
    'COMP SCI 513',
    'COMP SCI 514',
    'COMP SCI 524',
    'COMP SCI 525',
    'COMP SCI 534',
    'COMP SCI 540',
    'COMP SCI 541',
    'COMP SCI 559',
    'COMP SCI 565',
    'COMP SCI 566',
    'COMP SCI 570',
    'COMP SCI 571',
  ],
  'electives': [
    'COMP SCI 407',
    'COMP SCI 412',
    'COMP SCI 425',
    'COMP SCI 435',
    'COMP SCI 471',
    'COMP SCI 475',
    'COMP SCI 506',
    'COMP SCI 513',
    'COMP SCI 514',
    'COMP SCI 518',
    'COMP SCI 520',
    'COMP SCI 524',
    'COMP SCI 525',
    'COMP SCI 526',
    'COMP SCI 532',
    'COMP SCI 533',
    'COMP SCI 534',
    'COMP SCI 536',
    'COMP SCI 537',
    'COMP SCI 538',
    'COMP SCI 539',
    'COMP SCI 540',
    'COMP SCI 541',
    'COMP SCI 542',
    'COMP SCI 544',
    'COMP SCI 552',
    'COMP SCI 557',
    'COMP SCI 559',
    'COMP SCI 561',
    'COMP SCI 564',
    'COMP SCI 565',
    'COMP SCI 566',
    'COMP SCI 567',
    'COMP SCI 570',
    'COMP SCI 571',
    'COMP SCI 576',
    'COMP SCI 577',
    'COMP SCI 579',
    'COMP SCI 620',
    'COMP SCI 640',
    'COMP SCI 642',
    'COMP SCI 639',
  ],
};

// Color mapping for each tag (for multiple border colors)
const tagColors = {
  'basic-computer-sciences': '#ffd700',  // Yellow/Gold
  'theory-cs': '#e74c3c',                // Strong Red
  'software-hardware': '#3498db',        // Strong Blue
  'applications': '#2ecc71',             // Strong Green
  'electives': '#9b59b6',                // Strong Purple
};

// Function to parse course codes from requisites string
const parseCoursePrerequisites = (requisitesString) => {
  if (!requisitesString || requisitesString === 'None') return [];
  
  // Remove all zero-width spaces and other special unicode characters
  const cleanString = requisitesString.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Filter out exclusion and placement statements (these are NOT prerequisites)
  // Common patterns: 
  // - "Not open to students with credit for..." (exclusions)
  // - "placement into COMP SCI XXX" (placement tests, not prerequisites)
  const exclusionPatterns = [
    /Not open to students with credit for[^.]+/gi,
    /Not open to[^.]+/gi,
    /placement into[^,;)]+/gi,
  ];
  
  let filteredString = cleanString;
  exclusionPatterns.forEach(pattern => {
    filteredString = filteredString.replace(pattern, '');
  });
  
  // Look for "COMP SCI" followed by a number
  const compSciPattern = /COMP\s+SCI\s+(\d{3})/g;
  const courses = [];
  let match;
  
  while ((match = compSciPattern.exec(filteredString)) !== null) {
    const number = match[1];
    const normalizedCode = `COMP SCI ${number}`;
    if (!courses.includes(normalizedCode)) {
      courses.push(normalizedCode);
    }
  }
  
  // Also look for "E C E/COMP SCI" followed by a number
  const eceCsPattern = /E\s+C\s+E\/COMP\s+SCI\s+(\d{3})/g;
  while ((match = eceCsPattern.exec(filteredString)) !== null) {
    const number = match[1];
    const normalizedCode = `COMP SCI ${number}`;
    if (!courses.includes(normalizedCode)) {
      courses.push(normalizedCode);
    }
  }
  
  return courses;
};

// Function to extract course code with number from courseCode field
const extractCourseCode = (courseCodeString) => {
  // Remove zero-width characters
  const cleanString = courseCodeString.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Look for "COMP SCI" followed by a space and then a number
  // This handles both "COMP SCI 300" and "COMP SCI/MATH 240" formats
  const match = cleanString.match(/COMP\s+SCI[^\d]*(\d{3})/);
  if (match) {
    return `COMP SCI ${match[1]}`;
  }
  
  return null;
};

// Function to format course code for display (e.g., "COMP SCI 300" -> "CS 300")
const formatCourseCodeForDisplay = (courseCode) => {
  return courseCode.replace('COMP SCI', 'CS');
};

export const csConfig = {
  name: 'Computer Science',
  coursesData,
  requirementsStructure,
  tagToCoursesMap,
  tagColors,
  parseCoursePrerequisites,
  extractCourseCode,
  formatCourseCodeForDisplay,
};

