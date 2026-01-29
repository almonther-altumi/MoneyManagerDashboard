import React from "react";

const BugIcon = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 14V14.01M12 22C7.58172 22 4 18.4183 4 14V9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9V14C20 18.4183 16.4183 22 12 22ZM12 6V8" // Minimalist bug/alert shape modification or generic info
                // Actually let's use a proper Bug/Beetle shape or similar
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0" // Placeholder path? No wait.
            />
            <path d="M18.8235 9C19.8595 10.6667 21 11.6667 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.6667 4.14053 10.6667 5.17647 9M12 2V5M16 4.5L14.5 6M8 4.5L9.5 6M12 11V17M12 11H9M12 11H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round" />
        </svg>
    );
};

export default BugIcon;
