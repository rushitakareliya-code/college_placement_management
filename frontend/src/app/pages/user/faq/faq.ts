import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {

  faqs = [
    {
      question: "How can I apply for a job?",
      answer: "Browse the available job listings on the portal and click on the Apply button for the position you are interested in.",
      open: false
    },
    {
      question: "Do I need to create an account to apply?",
      answer: "Yes, students must create an account and login before applying for any job opportunity.",
      open: false
    },
    {
      question: "Are the job listings verified?",
      answer: "Yes, all job postings are reviewed and verified by the placement portal administrators before they are published.",
      open: false
    },
    {
      question: "Can I apply to multiple jobs?",
      answer: "Yes, students are allowed to apply to multiple job openings that match their qualifications.",
      open: false
    },
    {
      question: "How will I know if my application is shortlisted?",
      answer: "If your application is shortlisted, the recruiter or placement team will notify you through the portal or email.",
      open: false
    },
    {
      question: "Can I edit my profile after registration?",
      answer: "Yes, students can update their profile information such as phone number, address, or resume anytime.",
      open: false
    },
    {
      question: "Is there any fee for using the placement portal?",
      answer: "No, the portal is completely free for students to use.",
      open: false
    },
    {
      question: "How frequently are new jobs added?",
      answer: "New job postings are added regularly as companies submit new recruitment opportunities.",
      open: false
    },
    {
      question: "Can recruiters contact students directly?",
      answer: "Yes, recruiters may contact shortlisted candidates through the contact details provided in their profile.",
      open: false
    },
    {
      question: "Who should I contact if I face issues on the portal?",
      answer: "If you experience any technical issues, please contact our support team through the Contact Us page.",
      open: false
    }
  ];

}