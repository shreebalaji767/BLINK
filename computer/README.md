# BLINK Computer Conversation Engine

This is a programmed conversation engine for BLINK's fictional computer characters.

It is not an AI model and does not call an external LLM. It uses personality rules, deterministic variation, short-term conversation state, callbacks to earlier messages, simple fact memory, mood handling, and context-sensitive follow-up questions.

Conversation state is disposable and is not stored in Supabase.

Run with:
pip install -r requirements.txt
python app.py

The service listens on the PORT environment variable, default 8000.
