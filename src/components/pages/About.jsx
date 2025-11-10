import TopNavBar from '../TopNavBar'

export default function About(props) {
  return <div>
    <TopNavBar />
      <p>This site is under construction and subject to change.</p>
      <p>Idea:</p>
      <ol>
        <li>Get course data from <a href="https://guide.wisc.edu/courses/" target="_blank" rel="noopener noreferrer">https://guide.wisc.edu/courses/</a> and parse it into a JSON file</li>
        <li>Parse the JSON file into a React Flow graph</li>
      </ol>

      <p>A few notes:</p>
      <ul>
      <li>Currently only supports Computer Science major, but the plan is to support all majors. (If I have time)</li>
      <li>Click on a course to view its details and prerequisites</li>
      <li>Prerequisites might be AND or OR, refer to the detail tab for accurate info</li>
      <li>major requirement tags are hardcoded</li>
      <li>Prerequisites from other majors are not included (e.g. Some CS courses require MATH)</li>
      </ul>

      <p><b>What needs to change? Please send me an email at <a href="mailto:dehan.li@wisc.edu">dehan.li@wisc.edu</a>.</b></p>

    </div>



}