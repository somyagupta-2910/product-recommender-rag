// src/utils/courseUtils.js

import { MdOutlineDescription, MdMenuBook, MdVideoLibrary, MdOutlineChat, MdFlipCameraAndroid, MdOutlineFolderSpecial, MdQuiz, MdWorkOutline } from "react-icons/md";
import React from "react";
// -----------------------------
// Storage Helper Functions
// -----------------------------
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
};
// Helper function to generate a valid 24-character hex ObjectId
export const generateValidObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const randomChars = "xxxxxxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  return (timestamp + randomChars).toLowerCase();
};

// -----------------------------
// Component Types and Helpers
// -----------------------------
export const componentTypes = [
  { key: "overview", label: "Overview", icon: MdOutlineDescription, color: "text-blue-500" },
  { key: "readings", label: "Reading", icon: MdMenuBook, color: "text-purple-500" },
  { key: "videoLecture", label: "Video", icon: MdVideoLibrary, color: "text-red-500" },
  { key: "topic", label: "Interactive Instructor", icon: MdOutlineChat, color: "text-green-500" },
  { key: "flashcards", label: "FlashCard", icon: MdFlipCameraAndroid, color: "text-yellow-600" },
  { key: "caseStudy", label: "CaseStudy", icon: MdOutlineFolderSpecial, color: "text-indigo-500" },
  { key: "quiz", label: "Quiz", icon: MdQuiz, color: "text-orange-500" },
  { key: "project", label: "Project", icon: MdWorkOutline, color: "text-gray-500" },
];

// Mapping teacher/generic types to the specific keys used in EditCoursePage.
export const typeMap = {
  reading: "readings",
  video: "videolecture",
  flashcard: "flashcards",
  casestudy: "casestudy",
  lesson: "topic",
};

// Instead of using JSX:
export const getIconForType = (type) => {
  const lowerType = type.toLowerCase();
  const normalizedType = typeMap[lowerType] || lowerType;  
  const componentType = componentTypes.find((c) => c.key.toLowerCase() === normalizedType) || componentTypes[0];
  const Icon = componentType.icon;
  return React.createElement(Icon, {
    className: `w-5 h-5 ${componentType.color}`,
    title: componentType.label,
  });
};

export const transformContent = (content) => {
  if (!content || !content.milestones) return { milestones: [] };
  console.log('transform content')

  // Clone and sort milestones
  const sortedMilestones = [...content.milestones].sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    ...content,
    onboardingInstructions: content.onboarding_instructions || "",
    milestones: sortedMilestones.map((milestone) => {
      // Ensure documents is properly preserved
      const documents = Array.isArray(milestone.documents) ? milestone.documents : [];
      
      return {
        ...milestone,
        collapsed: false,
        milestoneTitle: milestone.title,
        milestoneObjective: milestone.description,
        documents: documents, // Explicitly assign the documents array
        components: milestone.content
          ? milestone.content.map((component) => {
              const typeLower = component.type.toLowerCase();
              let finalContent;
              if (typeLower === "video" || typeLower === "videolecture") {
                console.log('Transforming video component:', component);
                // If the content is an array, wrap it inside an object with the `links` property.
                const links = Array.isArray(component.content) ? component.content : component.content?.links || [];
                finalContent = { links };
              } else if (typeLower === "readings") {
                console.log('Transforming reading component:', component);
                const documents = Array.isArray(component.content) ? component.content : component.content?.documents || [];
                finalContent = { documents };
              } else if (typeLower === "quiz" || typeLower === "flashcard") {
                finalContent = {
                  generated: component.content ? JSON.stringify(component.content) : null,
                };
              } else {
                finalContent = { generated: component.content || null };
              }
              return {
                ...component,
                _id: component.contentId ? component.contentId : generateValidObjectId(),
                isPersonalized: typeLower === "video" || typeLower === "videolecture" ? false : component.personalizedGeneration ?? true,
                content: finalContent,
              };
            })
          : [],
      };
    }),
  };
};
