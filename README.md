# HKMSP Login Page Interface

This repository contains the HTML structure for the sign-in page of the **HKMSP (Headknod Managed Service Provider)** workspace.

## Overview

The provided code snippet defines the front-end structure for a modern login experience, featuring a sign-in form and a dynamic-looking side panel for system status.

## Key Components

### 1. Sign-in Form

The main section includes a standard login form with the following elements:
*   **Email Address** input field.
*   **Password** input field.
*   A "Remember this device" checkbox.
*   A "Forgot password?" button.
*   A "Sign in to HKMSP" submit button.

**Note:** The form is currently configured for demonstration purposes only (`onsubmit="event.preventDefault(); alert('Demo only: no backend wired yet.');"`). It does not connect to a live backend for authentication.

### 2. Status Panel (hk-login-side)

A visually distinct side panel is included to display live operational metrics, suggesting a comprehensive dashboard environment behind the login. The metrics include:
*   **Active clients:** Shows the current number of active clients and weekly change.
*   **Open tickets:** Displays the total number of open tickets, highlighting urgent ones.
*   **Remote sessions:** Indicates the number of active remote sessions.
*   **Chat channels:** Shows the count of available chat channels.

## Technology

The file is a pure HTML structure. It relies on external CSS (implied by the `hk-login-*` class names) for its styling and glassy visual effects.

## Usage

To view this interface, you would need to pair this HTML with the corresponding CSS and open the file in a web browser. The structure is ready for integration with a backend authentication system.
