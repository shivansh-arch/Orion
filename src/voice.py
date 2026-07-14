import speech_recognition as sr
import pyttsx3

recognizer = sr.Recognizer()
engine = pyttsx3.init()


def listen():
    with sr.Microphone() as source:
        print("Listening...")

        recognizer.adjust_for_ambient_noise(source, duration=1)

        try:
            audio = recognizer.listen(
                source,
                timeout=5,
                phrase_time_limit=15
            )
        except sr.WaitTimeoutError:
            print("Listening timed out.")
            return None

    try:
        query = recognizer.recognize_google(audio)
        print(f"You: {query}")
        return query

    except sr.UnknownValueError:
        print("Could not understand audio.")
        return None

    except sr.RequestError as e:
        print(f"Speech recognition error: {e}")
        return None


def speak(text):
    print(f"Orion: {text}")
    engine.say(text)
    engine.runAndWait()