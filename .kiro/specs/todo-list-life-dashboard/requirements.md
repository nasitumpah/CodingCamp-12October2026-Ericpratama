# Requirements Document

## Introduction

The Todo List Life Dashboard is a client-side web application that serves as a personal landing page combining time awareness, focus management, task tracking, and quick navigation. The application runs entirely in the browser using HTML, CSS, and vanilla JavaScript, with all user data persisted through the browser Local Storage API. The dashboard presents four features on a single page: a time-based greeting, a 25-minute focus timer, a to-do list with full task management, and a set of configurable quick links to favorite websites.

## Glossary

- **Dashboard**: The single-page web application that displays the greeting, focus timer, to-do list, and quick links.
- **Greeting_Module**: The component that displays the current time, current date, and a time-of-day greeting message.
- **Focus_Timer**: The component that counts down from 25 minutes and supports start, stop, and reset actions.
- **Todo_List**: The component that manages the collection of user tasks (add, edit, complete, delete).
- **Task**: A single to-do item consisting of description text and a completion state.
- **Quick_Links**: The component that displays buttons which open user-defined websites and manages the stored link collection.
- **Quick_Link**: A single saved entry consisting of a label and a target URL.
- **Local_Storage**: The browser Local Storage API used to persist tasks and quick links client-side.
- **Time_Of_Day**: A classification of the current hour into morning, afternoon, evening, or night, used to select the greeting message.

## Requirements

### Requirement 1: Time and Date Display

**User Story:** As a user, I want to see the current time and date on the dashboard, so that I stay aware of the present moment while I work.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Greeting_Module SHALL display the current local time in HH:MM:SS format using the user's browser locale and timezone.
2. WHEN the Dashboard loads, THE Greeting_Module SHALL display the current local date including the weekday name, month name, day number, and four-digit year, formatted according to the user's browser locale.
3. WHILE the Dashboard is open, THE Greeting_Module SHALL update the displayed time at least once every 1 second and SHALL update the displayed date when the local date changes.

### Requirement 2: Time-Based Greeting

**User Story:** As a user, I want a greeting that reflects the time of day, so that the dashboard feels personal and welcoming.

#### Acceptance Criteria

1. WHEN the current time in the user's local browser time zone is between 05:00 and 11:59 (morning), THE Greeting_Module SHALL display a greeting message that includes a morning-specific greeting label.
2. WHEN the current time in the user's local browser time zone is between 12:00 and 16:59 (afternoon), THE Greeting_Module SHALL display a greeting message that includes an afternoon-specific greeting label.
3. WHEN the current time in the user's local browser time zone is between 17:00 and 20:59 (evening), THE Greeting_Module SHALL display a greeting message that includes an evening-specific greeting label.
4. WHEN the current time in the user's local browser time zone is between 21:00 and 04:59 (night), THE Greeting_Module SHALL display a greeting message that includes a night-specific greeting label.
5. THE Greeting_Module SHALL display a greeting label that is visually distinct for each of the four time periods, so that a tester can determine which period is active by reading the greeting text alone.
6. WHEN the time transitions from one time period to the next while the dashboard is open, THE Greeting_Module SHALL update the displayed greeting to reflect the new time period within 60 seconds of the boundary without requiring a manual page refresh.

### Requirement 3: Focus Timer Countdown

**User Story:** As a user, I want a 25-minute focus timer, so that I can work in focused intervals.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Focus_Timer SHALL display a remaining time of 25 minutes and 0 seconds in a state that is not counting down.
2. WHEN the user activates the start control WHILE the Focus_Timer is not counting down and the remaining time is greater than 0, THE Focus_Timer SHALL begin counting down toward 0 minutes and 0 seconds.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL decrease the displayed remaining time by exactly 1 second once every 1 second (±100 milliseconds).
4. WHEN the user activates the stop control WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL pause and retain the current remaining time without further decrementing until the start control is activated again.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL set the remaining time to 25 minutes and 0 seconds and enter a state that is not counting down, regardless of whether it was counting down or paused.
6. WHEN the remaining time reaches 0 minutes and 0 seconds, THE Focus_Timer SHALL stop counting down and display a remaining time of 0 minutes and 0 seconds.
7. IF the user activates the start control WHILE the Focus_Timer is counting down, THEN THE Focus_Timer SHALL continue counting down from the current remaining time without resetting or restarting.

### Requirement 4: Add Tasks

**User Story:** As a user, I want to add tasks to my to-do list, so that I can track what I need to do.

#### Acceptance Criteria

1. WHEN the user submits a task with description text containing at least 1 non-whitespace character and at most 200 characters in total length, THE Todo_List SHALL add a new Task with that description and an incomplete state, and SHALL clear the input field.
2. WHEN a new Task is added, THE Todo_List SHALL display the Task at the end of the task list.
3. IF the user submits a task with empty description text or description text containing only whitespace characters, THEN THE Todo_List SHALL display an error message indicating that a description is required and SHALL NOT add a Task.
4. IF the user submits a task with description text exceeding 200 characters, THEN THE Todo_List SHALL display an error message indicating the maximum length allowed and SHALL NOT add a Task.

### Requirement 5: Edit Tasks

**User Story:** As a user, I want to edit an existing task, so that I can correct or update its description.

#### Acceptance Criteria

1. WHEN the user activates the edit control for a Task, THE Todo_List SHALL display the current description text of that Task in an editable input pre-populated with that text.
2. WHEN the user confirms an edit with description text containing at least 1 non-whitespace character and at most 200 characters, THE Todo_List SHALL replace the Task description with the entered text.
3. IF the user confirms an edit with description text that is empty or contains only whitespace characters, THEN THE Todo_List SHALL retain the previous Task description unchanged and display an error indication that a non-empty description is required.
4. IF the user confirms an edit with description text exceeding 200 characters, THEN THE Todo_List SHALL retain the previous Task description unchanged and display an error indication that the description exceeds the maximum length.
5. WHEN the user cancels an edit before confirming, THE Todo_List SHALL retain the previous Task description unchanged and exit the editable input.

### Requirement 6: Mark Tasks Complete

**User Story:** As a user, I want to mark a task as done, so that I can see what I have finished.

#### Acceptance Criteria

1. WHEN the user activates the completion control for an incomplete Task, THE Todo_List SHALL set the Task completion state to complete within 1 second.
2. WHEN the user activates the completion control for a complete Task, THE Todo_List SHALL set the Task completion state to incomplete within 1 second.
3. WHEN a Task completion state changes to complete, THE Todo_List SHALL apply a visual indication distinguishing the Task from incomplete Tasks.
4. WHEN a Task completion state changes to incomplete, THE Todo_List SHALL remove the completed-state visual indication from the Task.
5. IF a Task completion state change fails to persist, THEN THE Todo_List SHALL retain the Task's prior completion state and display an error indication to the user.

### Requirement 7: Delete Tasks

**User Story:** As a user, I want to delete a task, so that I can remove items I no longer need.

#### Acceptance Criteria

1. WHEN the user activates the delete control for a Task, THE Todo_List SHALL remove that Task from the stored task collection within 1 second.
2. WHEN a Task is removed from the stored task collection, THE Todo_List SHALL remove the Task from the displayed task list within 1 second.
3. IF the user activates the delete control for a Task that no longer exists in the stored task collection, THEN THE Todo_List SHALL leave the stored task collection and displayed task list unchanged and display a message indicating the Task could not be found.
4. WHEN a Task is removed and no Tasks remain in the stored task collection, THE Todo_List SHALL display an empty-state message indicating there are no Tasks.

### Requirement 8: Persist Tasks

**User Story:** As a user, I want my tasks saved automatically, so that they remain available after I close and reopen the dashboard.

#### Acceptance Criteria

1. WHEN a Task is added, edited, completed, or deleted, THE Todo_List SHALL save the current task collection to Local_Storage within 1 second of the change.
2. WHEN the Dashboard loads, THE Todo_List SHALL read the task collection from Local_Storage and display each stored Task in the same order and completion state in which it was saved.
3. IF no task collection exists in Local_Storage when the Dashboard loads, THEN THE Todo_List SHALL display an empty task list containing zero Tasks.
4. IF the task collection in Local_Storage cannot be read or is not in a valid readable format, THEN THE Todo_List SHALL display an empty task list and SHALL display an error message indicating that saved tasks could not be loaded.
5. IF saving the task collection to Local_Storage fails, THEN THE Todo_List SHALL retain the current task collection in the active display and SHALL display an error message indicating that the change could not be saved.

### Requirement 9: Open Quick Links

**User Story:** As a user, I want buttons that open my favorite websites, so that I can navigate to them quickly.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Quick_Links SHALL display one button for each stored Quick_Link using the Quick_Link label, truncating any label longer than 30 characters with a trailing ellipsis.
2. WHILE no Quick_Link is stored, THE Quick_Links SHALL display a message indicating that no quick links are available and SHALL render no buttons.
3. WHEN the user activates a Quick_Link button, THE Quick_Links SHALL open the associated Quick_Link URL in a new browser tab within 1 second.
4. IF the activated Quick_Link URL is missing or malformed, THEN THE Quick_Links SHALL NOT open a new tab and SHALL display an error message indicating that the link is invalid.

### Requirement 10: Manage Quick Links

**User Story:** As a user, I want to add and remove quick links, so that I can control which websites appear on my dashboard.

#### Acceptance Criteria

1. WHEN the user submits a Quick_Link with a label of 1 to 50 characters after trimming leading and trailing whitespace and a well-formed URL of 1 to 2048 characters that uses the http or https scheme, THE Quick_Links SHALL add a new Quick_Link with that label and URL and SHALL display it on the dashboard.
2. WHEN the user activates the delete control for a Quick_Link, THE Quick_Links SHALL remove that Quick_Link and SHALL remove it from the dashboard display.
3. IF the user submits a Quick_Link whose label is empty or contains only whitespace after trimming, THEN THE Quick_Links SHALL reject the submission, SHALL NOT add a Quick_Link, and SHALL display an error indication identifying the label as invalid.
4. IF the user submits a Quick_Link whose URL is empty, exceeds 2048 characters, or is not a well-formed http or https URL, THEN THE Quick_Links SHALL reject the submission, SHALL NOT add a Quick_Link, and SHALL display an error indication identifying the URL as invalid.
5. WHILE a submission is rejected for an invalid label or URL, THE Quick_Links SHALL retain the user-entered label and URL values in the input controls.

### Requirement 11: Persist Quick Links

**User Story:** As a user, I want my quick links saved automatically, so that they remain available after I close and reopen the dashboard.

#### Acceptance Criteria

1. WHEN a Quick_Link is added or removed, THE Quick_Links SHALL save the current Quick_Link collection to Local_Storage within 1 second of the change.
2. IF saving the Quick_Link collection to Local_Storage fails, THEN THE Quick_Links SHALL retain the in-memory Quick_Link collection unchanged and display an error indication informing the user that the quick links could not be saved.
3. WHEN the Dashboard loads, THE Quick_Links SHALL read the Quick_Link collection from Local_Storage and display each stored Quick_Link in the order it was saved.
4. IF no Quick_Link collection exists in Local_Storage when the Dashboard loads, THEN THE Quick_Links SHALL display an empty Quick_Link set containing zero Quick_Links.
5. IF the Quick_Link collection read from Local_Storage is malformed or cannot be parsed, THEN THE Quick_Links SHALL display an empty Quick_Link set and discard the malformed stored data.

### Requirement 12: Technology and Structure Constraints

**User Story:** As a developer, I want the dashboard built with a constrained, framework-free stack, so that the project stays simple and maintainable.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using HTML for structure, CSS for styling, and vanilla JavaScript without front-end frameworks or third-party libraries.
2. THE Dashboard SHALL store all persistent data using the Local_Storage API without a backend server.
3. THE Dashboard SHALL include exactly one CSS file within a `css/` directory.
4. THE Dashboard SHALL include exactly one JavaScript file within a `js/` directory.
5. THE Dashboard SHALL render all UI elements, respond to all user interactions, and persist data correctly in the latest stable release of Chrome, Firefox, Edge, and Safari at the time of deployment.
6. IF Local_Storage is unavailable or a write operation fails, THEN THE Dashboard SHALL display an error message indicating that data cannot be saved and SHALL preserve the current in-memory state for the duration of the session.

### Requirement 13: Performance and Visual Design

**User Story:** As a user, I want a clean and responsive interface, so that the dashboard is pleasant and quick to use.

#### Acceptance Criteria

1. WHEN the user adds, edits, completes, or deletes a Task, THE Todo_List SHALL update the displayed task list within 200 milliseconds.
2. WHEN the user adds or removes a Quick_Link, THE Quick_Links SHALL update the displayed Quick_Link set within 200 milliseconds.
3. WHEN the Dashboard loads, THE Dashboard SHALL display the greeting, focus timer, to-do list, and quick links as four visually distinct sections, each with a labeled heading.
4. THE Dashboard SHALL render all body text at a minimum font size of 14 pixels and maintain a text-to-background contrast ratio of at least 4.5:1.
5. WHILE the viewport width is between 320 pixels and 1920 pixels, THE Dashboard SHALL display all four sections without horizontal scrolling and without content overlap.

### Requirement 14: Light / Dark Mode

**User Story:** As a user, I want to switch between a light and dark color theme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL display a theme-toggle control that is visible at all times and can be activated with a keyboard.
2. WHEN the user activates the theme-toggle control while the dark theme is active, THE Dashboard SHALL switch to the light theme and update the toggle control's accessible label to reflect the new state.
3. WHEN the user activates the theme-toggle control while the light theme is active, THE Dashboard SHALL switch to the dark theme and update the toggle control's accessible label to reflect the new state.
4. WHEN the theme changes, THE Dashboard SHALL save the chosen theme identifier to Local_Storage under the key `tldd.theme` within 1 second.
5. WHEN the Dashboard loads, THE Dashboard SHALL read the stored theme from Local_Storage and apply it before the first paint so that no flash of the wrong theme is visible.
6. IF no theme is stored in Local_Storage when the Dashboard loads, THEN THE Dashboard SHALL apply the dark theme by default.
7. THE theme-toggle control SHALL carry an `aria-label` attribute whose value describes the action it will perform (e.g., "Switch to light mode" when dark is active, "Switch to dark mode" when light is active).

### Requirement 15: Custom Name in Greeting

**User Story:** As a user, I want to enter my name so that the greeting addresses me personally.

#### Acceptance Criteria

1. THE Greeting_Module SHALL display a text input near the greeting that accepts a name of at most 50 characters.
2. WHEN the user saves a non-empty name (after trimming), THE Greeting_Module SHALL incorporate that name into the greeting label, producing a message of the form "[Period greeting], [Name]!" (e.g., "Good morning, Alex!").
3. WHEN no name is stored or the stored name is empty after trimming, THE Greeting_Module SHALL display the period greeting without a name (e.g., "Good morning!"), matching existing behavior.
4. WHEN the user saves an empty name or a name containing only whitespace, THE Greeting_Module SHALL clear the stored name, revert the greeting to the nameless form, and remove the name from Local_Storage.
5. WHEN a name is saved, THE Greeting_Module SHALL store the trimmed name in Local_Storage under the key `tldd.name` within 1 second.
6. WHEN the Dashboard loads, THE Greeting_Module SHALL read the stored name from Local_Storage and apply it to the greeting immediately on first render.
7. IF the stored name value is not a string or exceeds 50 characters, THEN THE Greeting_Module SHALL treat it as absent and display the nameless greeting without showing an error.

### Requirement 16: Configurable Pomodoro Duration

**User Story:** As a user, I want to set the focus timer session length, so that I can adapt the timer to my preferred work interval.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display a numeric input that accepts an integer session length in minutes between 1 and 90 inclusive.
2. WHEN the user sets a valid duration and confirms it (e.g., by pressing Enter or activating a Set button), THE Focus_Timer SHALL persist the value to Local_Storage under the key `tldd.pomoDuration` within 1 second.
3. WHEN the user activates the reset control after a custom duration has been set, THE Focus_Timer SHALL reset the remaining time to the custom duration rather than the default 25 minutes.
4. WHEN the Dashboard loads, THE Focus_Timer SHALL read the stored duration from Local_Storage and use it as the starting remaining time, displaying the value formatted as `MM:SS`.
5. IF no duration is stored in Local_Storage when the Dashboard loads, THEN THE Focus_Timer SHALL use 25 minutes as the default starting remaining time.
6. IF the user enters a value outside the range 1–90 or a non-integer value, THEN THE Focus_Timer SHALL reject it, display an error message, and retain the current duration.
7. WHEN the user changes the duration value in the input while the timer is counting down, THE Focus_Timer SHALL NOT interrupt or reset the current countdown; the new duration SHALL take effect only on the next reset.

### Requirement 17: Prevent Duplicate Tasks

**User Story:** As a user, I want the dashboard to warn me when I try to add a task that already exists, so that I do not accidentally create duplicate entries.

#### Acceptance Criteria

1. WHEN the user attempts to add a task whose description, after trimming and case-insensitive comparison, matches the description of any existing Task in the stored task collection, THE Todo_List SHALL reject the addition, display the message "A task with this description already exists.", and SHALL NOT add a new Task.
2. WHEN the user confirms an edit whose new description, after trimming and case-insensitive comparison, matches the description of any existing Task other than the Task being edited, THE Todo_List SHALL reject the edit, display the message "A task with this description already exists.", and SHALL NOT update the Task description.
3. WHEN a submitted or edited description does not match any existing Task description (case-insensitively, after trimming), THE Todo_List SHALL proceed with the add or edit operation as specified in Requirements 4 and 5.

### Requirement 18: Sort Tasks

**User Story:** As a user, I want to choose how my task list is sorted, so that I can find and prioritize tasks easily.

#### Acceptance Criteria

1. THE Todo_List SHALL display a sort-order selector control above the task list offering exactly five options: "Date added ↑" (oldest first), "Date added ↓" (newest first), "A → Z" (alphabetical ascending, case-insensitive), "Z → A" (alphabetical descending, case-insensitive), and "Incomplete first" (incomplete tasks before complete tasks, preserving insertion order within each group).
2. WHEN the user selects a sort option, THE Todo_List SHALL re-render the displayed task list in the chosen order within 200 milliseconds.
3. THE sort operation SHALL be display-only; THE Todo_List SHALL NOT mutate the stored task array or the insertion order of tasks in Local_Storage.
4. WHEN the user selects a sort option, THE Todo_List SHALL save the chosen sort option identifier to Local_Storage under the key `tldd.taskSort` within 1 second.
5. WHEN the Dashboard loads, THE Todo_List SHALL read the stored sort option from Local_Storage and apply it to the initial render.
6. IF no sort option is stored in Local_Storage when the Dashboard loads, THEN THE Todo_List SHALL default to "Date added ↑" (insertion order).
7. IF the stored sort option value is not one of the five valid option identifiers, THEN THE Todo_List SHALL fall back to "Date added ↑" without showing an error.
