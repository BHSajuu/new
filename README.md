# Chatty

Chatty is a MERN (MongoDB, Express, React, Node.js) based real-time chat application. It allows users to communicate seamlessly with features like user authentication, real-time messaging, and more.

## Features

- User authentication (Sign up, Login, Logout)
- Real-time messaging using WebSockets
- Responsive design for all devices
- User profile management
- Theme customization with up to 32 different color options available in settings

## Tech Stack

- **Frontend**: React,Javascript, Tailwind CSS, DaisyUI, Zustand, react-media-recorder 
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO

## Future Improvements

Here are some features planned for future implementation:

- Implement a video calling feature for enhanced communication.✅

- Integrate AI suggestions using Google API for smarter interactions.
    - Language translation & localization ✅
       - Automatically translate messages between users speaking different languages. Send received text to Gemini with a prompt like “Translate to English/French/etc.” And this English/French/etc depends on the lamguage which is selected by user in setting . Let me explain the suitition more , suppose person1(who know bangali) chatting with person2(who know Hindi) , then in person1 chatContinar , all the messages are shown in Bangali including the message when sent by person2 in hindi but Gimini API convert that Hindi message and show it as bangali ,as our person1 only know bangali ,also if the person1 writing code using English keyboard then aslo after sending the message ,the message should appear in Bangali . Do the similar for person2 aslo. 

    - Smart suggestions & auto‑completion
       - Reply suggestions: Show short response options (like “👍 Got it”, “Sounds good”) based on the ongoing conversation.
       - Typing assist: Suggest next words or sentences as the user types to accelerate messaging.

    - Talking with Vapi
       - Develop an virtual assistant who can read the upcoming message or last comed message and tell user about the message and if user say "reply" and then told the reply answer then send this reply to that person .  

- Add a payment gateway to enable premium AI suggestion features.

- Add a "Forgot Password" recovery link for user accounts. ✅

- Display the last message from a user at the top of the sidebar for better conversation tracking.

- Introduce a message delete and edit option after sending, similar to WhatsApp.✅

- Enable voice message sending functionality, inspired by WhatsApp.✅

- Add feature that user can able to invite his friend via whatApp just by entering his friend whatApp number.

- Implement Message Forwarding feature . 

- Implement group creating feature . Also in the sidebar ,along with the Show online ,another two botton friends and group filter.

- While displaying all the users in siderbar , then along with their name show frnd or random in bracket according to relation . Also implement the feature that if the listed user is not friend then the auth user should able to send a friend request to become as friend . Obiously there should be one unFriend option . 

