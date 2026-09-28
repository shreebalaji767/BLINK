# BLINK — How It Works

## 1. What BLINK Is

BLINK is a lightweight social communication application designed for temporary, disappearing communication.

Users can create an account, find other users by username, add friends, chat, send temporary media, post stories, and use other BLINK features provided by the application.

BLINK is designed around the idea of keeping shared content temporary rather than treating every message or piece of media as permanent.

---

## 2. How Accounts Work

A BLINK account is associated with an email address and a password.

After creating an account, a user can have a BLINK username. The username is used to identify and find people inside BLINK.

Users may be able to change account information such as:

- Name
- Username
- Email address
- Password
- Profile avatar
- Privacy settings

The account's internal unique identifier is used by the application to connect the account with its friends, conversations, and other account-related records. This identifier is not intended to be the normal way users find each other.

---

## 3. How Email IDs Are Used

BLINK uses an email address primarily for account authentication and account-related communication.

Depending on the application's configuration, an email address may be used for:

- Creating an account
- Signing in
- Confirming an account or email address
- Changing an email address
- Recovering access to an account
- Important account or security-related messages

An email address is not intended to be used as a public username.

Users can normally identify and find each other through their BLINK username instead.

BLINK should not display a user's email address to other users as part of the normal social profile unless the application explicitly provides such a feature.

---

## 4. How Passwords Are Handled

BLINK requires a password for password-based accounts.

Passwords are authentication credentials and should never be treated as normal profile information.

BLINK does not need to display a user's password to the user or to other users.

The application sends password information only through its authentication process. Passwords should be stored and processed by the authentication system using appropriate security mechanisms rather than being stored as ordinary readable profile data.

Users should:

- Use a strong, unique password.
- Never share their password with another person.
- Never put passwords into usernames, messages, stories, or other public content.
- Change their password if they believe their account may have been compromised.

---

## 5. What Data BLINK Uses

The exact data used by BLINK depends on the features a user uses and the application's current configuration.

BLINK may use account and application data such as:

### Account information
- Email address
- Username
- Display name
- Account identifier
- Profile avatar or related profile settings

### Social information
- Friend requests
- Friend relationships
- Blocked users
- Conversations
- Messages

### Temporary content
- Snaps
- Stories
- Uploaded media
- Captions
- Creation and expiry information

### Application information
- Account settings
- Privacy settings
- Authentication/session information
- Information required to operate and secure the application

Some BLINK content is designed to expire or disappear according to the application's configured retention rules.

Temporary or disappearing content should not be interpreted as a guarantee that nobody can copy, photograph, screen-record, or otherwise preserve content before it expires.

---

## 6. What BLINK Does Not Do

BLINK is designed to minimize unnecessary permanent social content, but users should understand the limits of any online application.

BLINK does not:

- Need to make a user's email address their public username.
- Intentionally expose a user's password as readable profile information.
- Require users to search for friends using their internal account ID.
- Guarantee that temporary content can never be copied before it expires.
- Guarantee that content cannot be captured by another device.
- Guarantee that an account can never be compromised.
- Claim that disappearing content is the same thing as completely unrecoverable content in every technical situation.

BLINK also does not use the phrase "disappearing" to mean that a user should ignore normal online safety.

Do not share passwords, authentication codes, financial information, or other sensitive information through BLINK messages.

---

## 7. Basic Project / Use Information

BLINK is a software project intended for learning, development, experimentation, and use according to the terms provided with the project.

The project may contain web application code, authentication logic, database interactions, temporary-content features, and other components required to operate BLINK.

When modifying or deploying BLINK, developers should review:

- Authentication configuration
- Account security
- Access permissions
- Data-retention behavior
- File/media storage
- Environment variables and secrets
- Production security settings

### Important

Do not commit passwords, API keys, private tokens, service credentials, or other secrets to the source-code repository.

Before deploying a modified version of BLINK, review the application's security and privacy configuration for the environment in which it will run.

---

## Privacy and Security Note

This document explains BLINK's intended application behavior in simple terms. It is not a guarantee that every future version of BLINK will behave identically.

The actual behavior of a deployed BLINK instance depends on its source code, configuration, authentication settings, storage configuration, and other services used by that deployment.

For security reasons, users should always assume that anything they deliberately share online may potentially be copied or preserved by someone who receives it.
