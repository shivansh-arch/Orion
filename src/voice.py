import speech_recognition as sr
import pyttsx3

recognizer = sr.Recognizer()

def listen():
    try:
        with sr.Microphone() as source:
            recognizer.energy_threshold = 100
            recognizer.dynamic_energy_threshold = False
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("Listening...")
            try:
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=15)
            except sr.WaitTimeoutError:
                print("Listening timed out.")
                return None
        query = recognizer.recognize_google(audio)
        print(f"You said: {query}")
        return query
    except sr.UnknownValueError:
        print("Could not understand audio.")
        return None
    except sr.RequestError as e:
        print(f"Speech recognition error: {e}")
        return None
    except Exception as e:
        print(f"Mic error: {e}")
        return None

def speak(text):
    print(f"Orion: {text}")
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()
    engine.stop()

if __name__ == "__main__":
    speak("Hello, I am Orion. Your personal AI assistant.")
    query = listen()
    if query:
        speak(f"You said: {query}")