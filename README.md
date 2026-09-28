# BLINK

BLINK is a lightweight social communication web application focused on simple, temporary, and disappearing communication.

## What BLINK Includes

- User accounts and authentication
- Username-based people search
- Friend requests and friend relationships
- Private conversations
- Temporary and disappearing messages
- Snaps and temporary media
- Stories
- Profile and account settings
- Privacy options such as Ghost Mode
- Dark and light appearance options
- Account email and password management
- Responsive web interface for desktop and mobile-sized screens

## Usernames

Users can have a unique BLINK username that is used to identify and find people inside the application.

Usernames are intended to be easier and safer to use socially than exposing internal account identifiers.

## Accounts

BLINK accounts use an email address and password for authentication.

Account settings can include information such as:

- Name
- Username
- Email address
- Password
- Profile avatar
- Privacy settings
- Appearance preferences

Passwords are authentication credentials and are not intended to be displayed as normal profile information.

## Temporary Communication

BLINK is designed around temporary communication.

Depending on the feature and current application configuration, messages, snaps, stories, and other content may be designed to expire or disappear after a defined period.

Disappearing content should not be treated as a guarantee that another person cannot copy, screenshot, screen-record, photograph, or otherwise preserve it before it expires.

## Privacy

BLINK is designed to avoid making internal account identifiers the normal way users find each other.

The application can use account, profile, social, authentication, and temporary-content information required to provide its features.

Users should never share passwords, authentication codes, financial information, or other sensitive information through chats or public content.

## Project Structure

The project is a web application built with:

- Next.js
- React
- TypeScript
- CSS
- Authentication and data-access components
- Server and client application components

The repository contains the application source code, UI components, authentication routes, shared utilities, configuration files, and database-related project files required for development.

## Running the Project

For local development:

1. Install Node.js.
2. Clone the repository.
3. Install the project dependencies with `npm install`.
4. Configure the required environment variables for your own development environment.
5. Start the development server with `npm run dev`.
6. Open the local address shown by the development server.

The exact environment configuration required for a deployment depends on how the application is being hosted.

## Development

BLINK is a software project that can be modified, extended, and used for development, learning, experimentation, and deployment.

When developing or deploying BLINK:

- Keep secrets and private credentials out of source code.
- Review authentication and access controls.
- Review data-retention behavior.
- Review privacy settings and permissions.
- Use appropriate production security practices.
- Test changes before deploying them to a live environment.

## Project Goal

The goal of BLINK is to provide a simple social communication experience centered around usernames, friends, private conversations, temporary content, and user-controlled account settings.

BLINK is an evolving project. Features and behavior may change as development continues.
