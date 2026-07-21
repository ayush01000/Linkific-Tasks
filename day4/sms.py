import json
from pathlib import Path

DATA_FILE = Path("students.json")


def load_students():
    """Load student records from the JSON file."""
    if not DATA_FILE.exists():
        return []

    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        print("Warning: Could not read students.json. Starting with an empty list.")
        return []


def save_students(students):
    """Save student records to the JSON file."""
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(students, file, indent=4)


def get_non_empty_input(message):
    """Keep asking until the user enters a value."""
    while True:
        value = input(message).strip()
        if value:
            return value
        print("This field cannot be empty.")


def get_valid_age(message):
    """Accept only a reasonable numeric age."""
    while True:
        value = input(message).strip()

        if value.isdigit():
            age = int(value)
            if 1 <= age <= 100:
                return age

        print("Enter a valid age between 1 and 100.")


def get_unique_roll_number(students):
    """Ask for a roll number that does not already exist."""
    while True:
        roll_number = get_non_empty_input("Enter roll number: ")

        duplicate = any(
            student["roll_number"].lower() == roll_number.lower()
            for student in students
        )

        if not duplicate:
            return roll_number

        print("A student with this roll number already exists.")


def find_student_index(students, roll_number):
    """Return the index of a student using the roll number."""
    for index, student in enumerate(students):
        if student["roll_number"].lower() == roll_number.lower():
            return index

    return -1


def add_student(students):
    print("\n--- Add Student ---")

    student = {
        "roll_number": get_unique_roll_number(students),
        "name": get_non_empty_input("Enter student name: "),
        "age": get_valid_age("Enter student age: "),
        "course": get_non_empty_input("Enter course: "),
        "email": get_non_empty_input("Enter email: "),
    }

    students.append(student)
    save_students(students)
    print("Student added successfully.")


def display_student(student):
    print("-" * 45)
    print(f"Roll Number : {student['roll_number']}")
    print(f"Name        : {student['name']}")
    print(f"Age         : {student['age']}")
    print(f"Course      : {student['course']}")
    print(f"Email       : {student['email']}")


def view_students(students):
    print("\n--- All Students ---")

    if not students:
        print("No student records found.")
        return

    for student in students:
        display_student(student)

    print("-" * 45)
    print(f"Total students: {len(students)}")


def search_student(students):
    print("\n--- Search Student ---")
    roll_number = get_non_empty_input("Enter roll number: ")

    index = find_student_index(students, roll_number)

    if index == -1:
        print("Student not found.")
        return

    display_student(students[index])


def update_student(students):
    print("\n--- Update Student ---")
    roll_number = get_non_empty_input("Enter roll number: ")

    index = find_student_index(students, roll_number)

    if index == -1:
        print("Student not found.")
        return

    student = students[index]
    display_student(student)

    print("\nPress Enter to keep the current value.")

    new_name = input(f"Name [{student['name']}]: ").strip()
    new_age = input(f"Age [{student['age']}]: ").strip()
    new_course = input(f"Course [{student['course']}]: ").strip()
    new_email = input(f"Email [{student['email']}]: ").strip()

    if new_name:
        student["name"] = new_name

    if new_age:
        if new_age.isdigit() and 1 <= int(new_age) <= 100:
            student["age"] = int(new_age)
        else:
            print("Invalid age. Previous age was kept.")

    if new_course:
        student["course"] = new_course

    if new_email:
        student["email"] = new_email

    save_students(students)
    print("Student updated successfully.")


def delete_student(students):
    print("\n--- Delete Student ---")
    roll_number = get_non_empty_input("Enter roll number: ")

    index = find_student_index(students, roll_number)

    if index == -1:
        print("Student not found.")
        return

    display_student(students[index])

    confirmation = input("Delete this student? (y/n): ").strip().lower()

    if confirmation == "y":
        students.pop(index)
        save_students(students)
        print("Student deleted successfully.")
    else:
        print("Delete operation cancelled.")


def show_menu():
    print("\n" + "=" * 45)
    print("        STUDENT MANAGEMENT SYSTEM")
    print("=" * 45)
    print("1. Add student")
    print("2. View all students")
    print("3. Search student")
    print("4. Update student")
    print("5. Delete student")
    print("6. Exit")


def main():
    students = load_students()

    while True:
        show_menu()
        choice = input("Enter your choice (1-6): ").strip()

        if choice == "1":
            add_student(students)
        elif choice == "2":
            view_students(students)
        elif choice == "3":
            search_student(students)
        elif choice == "4":
            update_student(students)
        elif choice == "5":
            delete_student(students)
        elif choice == "6":
            print("Thank you for using the Student Management System.")
            break
        else:
            print("Invalid choice. Enter a number from 1 to 6.")


if __name__ == "__main__":
    main()
