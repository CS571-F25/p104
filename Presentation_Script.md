# Presentation Script: BadgerCourseMap

**Time:** Approx. 4 Minutes
**Goal:** Showcase features, demonstrate user flow, and explain design choices.

---

## 1. Introduction (0:00 - 0:30)
**[Action: Start on the Home Page (Course Map View)]**

"Hi everyone, I’m [Name]. I’m here to introduce **BadgerCourseMap**, an interactive tool designed to help UW-Madison Computer Science students navigate their complex major requirements.

We all know the struggle: trying to figure out which classes to take next, only to realize you missed a prerequisite three semesters ago. The text-based course guide works, but it doesn't show you the *big picture*. My project solves this by visualizing the entire CS curriculum as an interactive, connected graph."

---

## 2. Core Feature: The Interactive Map (0:30 - 2:00)
**[Action: Stay on Home Page]**

"Let's dive into the core feature. This is the **Prerequisite Tree**.

**[Action: Zoom in and pan around the graph slightly]**
Instead of a static list, every course is a node. I’ve used **React Flow** to build this visualization. It allows you to zoom in and out to see the entire major at a glance or focus on a specific level.

**[Action: Click on a specific node, e.g., 'CS 537' (Operating Systems) or a similar upper-level course]**
Watch what happens when I click on a course like **CS 537**.
1.  **Path Highlighting:** The application instantly highlights the specific path of prerequisites leading to this course, while dimming the irrelevant nodes. This lets a student immediately see: 'To take OS, I need to have finished Machine Org and Data Structures first.'
2.  **Context Preservation:** I designed this split-screen layout so you never lose your place. On the right is your graph; on the left is the **Detail Sidebar**.

**[Action: Point to Sidebar 'Detail' tab]**
Here, you get the essential info: credits, description, and learning outcomes, pulled directly from my data set."

---

## 3. Feature: Filtering & Planning (2:00 - 2:45)
**[Action: Click on the 'Requirements' tab in the Sidebar]**

"It's not just about one course. Students think in terms of requirements.
In the **Requirements Tab**, I’ve broken down the major into categories like 'Basic Computer Sciences' or 'Hardware'.

**[Action: Check `Basic Computer Sciences` checkbox]**
If I check 'Basic Computer Sciences', the graph updates to verify which courses satisfy that specific requirement. This visual filtering helps students audit their progress or plan a specific track, like focusing purely on AI or Hardware courses."

---

## 4. Feature: Course Catalog Search (2:45 - 3:15)
**[Action: Click 'Courses' in the Navigation Bar]**

"Sometimes you just need to find a course quickly without the visual clutter. That’s where the **Course List** page comes in.

**[Action: Type 'Operating' or 'Artificial' into the search bar]**
I implemented a responsive search filter here. As you type, it filters the entire catalog by name, code, or even words in the description. It’s accessible, fast, and lists explicit prerequisites clearly in red text for quick checks."

---

## 5. Design Decisions & Accessibility (3:15 - 3:50)
**[Action: Navigate back to Home or About Page]**

"I want to highlight a few key design decisions:

1.  **Aesthetics:** I custom-designed the logo and chose a strict **Black and White theme**. This was intentional. Course maps can get messy and colorful with hundreds of nodes. The monochrome palette reduces visual noise, ensuring that the *data*—visualized through connection lines and opacity—remains the focus.
2.  **Curved vs. Straight Edges:** I chose curved Bezier lines for the graph. In a dense network like this, straight lines tend to overlap and look like a grid. Curves make it much easier for the eye to follow a specific path from parent to child.
3.  **Accessibility:** I ensured the site is usable for everyone.
    *   I increased the color contrast of the graph edges to meet WCAG standards.
    *   All interactive elements, like the search bar, have proper ARIA labels.
    *   The page structure uses proper heading depths for screen readers."

---

## 6. Conclusion (3:50 - 4:00)
**[Action: Show 'About' Page briefly or return to Logo on Home]**

"In summary, BadgerCourseMap transforms a confusing list of requirements into a clear, navigable roadmap. It empowers students to take ownership of their academic journey. Thank you for listening!"
