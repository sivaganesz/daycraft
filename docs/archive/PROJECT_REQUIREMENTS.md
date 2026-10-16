Writing

Hey, buddy!

I want to learn everything from start to finish by building a real-world, production-ready To-Do web application. Let me explain my requirements clearly.

The goal is to understand the complete development and deployment process, from frontend to backend, backend to CI/CD, automated deployment, and VPS setup, including configuring my own domain and subdomains. The application should work like a real-world production system that anyone can use by registering and logging in individually, with each user having access only to their own data.

I want to build a simple To-Do application first, then gradually extend it with additional features. We should proceed step by step, completing, testing, committing, and deploying each stage before moving to the next one.

# 1\. Project Setup and Tech Stack

First, we need to establish the project foundation.

- Decide on a suitable tech stack for the frontend, backend, database, and other required technologies.
- Define a clean, scalable, and maintainable project structure.
- Set up the development environment and configuration management.
- Configure Docker and the necessary infrastructure.
- Set up Git and the branching strategy.
- Configure the VPS, domain, subdomains, and other deployment requirements as needed.
- Implement the initial CI/CD pipeline.

Once the project structure, tech stack, Docker configuration, infrastructure, and CI/CD pipeline are ready, commit and push the changes to the repository.

The goal is to complete the initial setup end to end and verify that everything works correctly.

# 2\. Authentication and Initial Deployment

After completing the project setup, implement the basic authentication system.

- User registration.
- User login and logout.
- Secure password handling.
- Appropriate authentication and authorization.
- Individual user accounts with access restricted to their own data.

Once authentication is implemented and tested, commit and push the changes.

The CI/CD pipeline should run automatically and deploy the application to the live environment according to the branching and deployment rules defined below.

Then, I will visit the live application and test the registration and login functionality.

After logging in successfully, the home page should initially display a simple welcome message, such as "Hey, White!" This will confirm that the authentication and deployment processes are working correctly.

We should not start building all the application features before this initial end-to-end flow is working.

# 3\. Application UI Development

Once authentication and deployment are working correctly, we can start developing the main application UI.

- Create a clean and responsive layout.
- Implement a sidebar for navigation.
- Add a navbar if it is needed.
- Implement light and dark themes.
- Ensure the application works correctly across desktop, tablet, and mobile screens.
- Maintain a consistent design system and reusable UI components.

The sidebar should display the available features. Basic features must always remain enabled, while optional features should appear in the sidebar only when users enable them through the settings page.

# 4\. To-Do Application Use Cases

The application will include the following basic and advanced use cases. Please review them and determine whether they are appropriate, practical, and purposeful for the application.

**Basic features:**

- Smart Daily Planner
- Deadline and Follow-up Tracker
- Focus-Based Task Manager

**Advanced features:**

- Drag-and-Drop Kanban To-Do
- Real-Time Collaborative To-Do

**Additional optional features:**

- Monthly Expense Tracker
- Productivity Insights and Habit Tracker

These features should be part of the same application, but users should be able to enable or disable the optional features according to their needs.

The basic features must always remain enabled and cannot be disabled. All other features should be configurable through the settings page. When a user enables an optional feature, its corresponding page should appear in the sidebar. When the user disables it, the page should disappear from the sidebar.

I understand that some use cases may not directly integrate with one another. However, I want to include them in the same application as long as they provide practical value.

Please review the use cases and help me identify any improvements or changes needed before implementation.

We should develop these features one by one. Each feature should be functional, responsive, properly tested, and integrated with the existing application before we move to the next one.

# 5\. Settings Page and Customization

I also want a settings page where users can manage their personal information, application preferences, branding, and optional features.

I am not yet sure how the settings page should be organized or what its UI should look like, so we can design it appropriately during development.

The settings page should include the following sections.

**A. Basic Information**

- Name.
- Email address.
- Phone number.
- Change password.

**B. Application Name and Logo**

- The default application name should be "Whitraworks".
- Users should be able to upload their own logo.
- The uploaded logo should replace the default logo displayed in the sidebar.
- Users should be able to change their logo whenever they want.

**C. Theme Customization**

- Provide seven theme color options, including blue, green, black, and other suitable colors.
- Allow users to choose their preferred theme color and save their selection.
- The default theme color should be black.
- Support light and dark modes.

**D. Optional Feature Management**

- Allow users to enable or disable optional features.
- Keep all basic features permanently enabled.
- Display enabled features in the sidebar.
- Remove disabled features from the sidebar without affecting unrelated features or user data.

**E. Audit Log**

- Maintain an audit log of important user actions and changes.
- Record what was changed, who made the change, and when it occurred.
- Use the audit log to help track changes and troubleshoot issues.

**F. Future Enhancements**

Later, we will add:

- User management.
- Role management.
- User invitations.
- Appropriate permissions and access controls.

We do not need to implement these future enhancements immediately, but the initial architecture should be designed so that they can be added later without requiring a complete redesign.

# 6\. Git Branching and CI/CD Pipeline Rules

I have an additional requirement regarding Git branches, Docker image creation, and automated deployment.

Whenever we create a new branch or work on an existing branch, we should commit and push our changes as usual.

The pipeline should behave differently depending on the target branch.

**A. Feature and Other Non-Master Branches**

For branches other than `master`:

- Run the necessary validation checks automatically after pushing changes.
- Perform linting, type checking, and relevant automated tests.
- Run builds or other lightweight checks when necessary to validate the code.
- Do not build or publish Docker images.
- Do not trigger automatic deployment to the live environment.

The purpose is to validate changes without wasting resources on unnecessary Docker image builds and deployments.

**B. Master Branch**

Only pushes to the `master` branch should trigger the complete production deployment process.

The pipeline should:

1. Run the required validation checks.
2. Build the Docker image.
3. Publish the image to the configured container registry, if one is used.
4. Deploy the application to the VPS.
5. Apply any required deployment steps safely.
6. Verify that the application is running correctly.

After a successful deployment, I should be able to access the live application through my configured domain or subdomain.

The deployment process should be automated, repeatable, and reliable.

# 7\. End-to-End Development Workflow

I want to follow a structured workflow throughout the entire project.

For each stage:

1. Understand the requirements.
2. Decide on the appropriate implementation approach.
3. Implement the feature.
4. Test it locally.
5. Run the required validation checks.
6. Commit and push the changes.
7. Allow the appropriate CI/CD pipeline to run.
8. Verify the results in the live environment whenever deployment is triggered.

We should not rush into implementing every feature at once. Instead, we should complete one stage, verify that it works, and then move forward.

The initial priority is to establish the project structure, choose the tech stack, configure Docker and the infrastructure, and set up the Git workflow and CI/CD pipeline. Then we should implement authentication and verify the first successful live deployment.

After that, we can develop the responsive UI, sidebar, themes, settings page, and the remaining use cases one by one.

My ultimate goal is to build a complete, production-ready To-Do application while learning the entire process, from frontend and backend development to Docker, CI/CD, VPS infrastructure, custom domains, subdomains, and automated production deployment.

Please guide me through the process step by step, explaining the important decisions and helping me understand why each part is needed. We should prioritize a clean architecture, security, maintainability, resource efficiency, and practical real-world implementation.