import json
import os.path
from copyreg import pickle

from Human import Human
from Student import Student
from Teacher import Teacher
import json


def save_to_json(filename, humans):  # hàm toàn cục phaải khai báo ở ngoaài
    try:
        with open(filename, 'w') as file:
            json.dump([h.to_dict() for h in humans], file, indent=4)
    except Exception as e:
        print(f"Error saving to JSON file: {e}")


def load_from_json(filename):
    try:
        with open(filename, 'r') as file:
            data_list = json.loads(file)
            humans = [Human.from_dict(d) for d in data_list]
            return humans
    except FileNotFoundError:
        return []

def save_human(filename,humans):
    try:
        with open(filename,'w') as file:
            pickle.dump(humans,file)
    except Exception as e:
        print(f"Error saving human: {e}")

def load_humans(filename):
    if not os.path.exists(filename):
        print("File not found.")
        return []
    try:
        with open(filename,'rb') as file:
            return pickle.load(file)
    except FileNotFoundError:
        return []

def menu():
    human = []
    while True:
        print('========== HUMAN MANAGEMENT ===========')
        print('1. Add Student/Teacher')
        print('2. Display List Student & Teacher')
        print('3. Delete by name')
        print('4. Search by year of birth')
        print('5. Exit')
        ch = input('Input choice (1-5): ')
        if ch == '1':
            choose = input("Enter Student (s) or Teacher (t): ")
            if choose.lower() == "s":
                h = Student()
            elif choose.lower() == "t":
                h = Teacher()
            else:
                print("Invalid choice, please choose s or t")
                continue
            h.input()
            human.append(h)
        elif ch == '2':
            if not human:
                print("Nothing to display")
            else:
                for h in human:
                    h.display()
        elif ch == '3':
            name = int(input('Enter the name to delete: '))
            found = next((h for h in human if h.name.lower() == name.lower()), None)
            # human = [h for h in human if h.name.lower() != name.lower()]
            # if not human:
            #     print('No human to delete')
            # else:
            #     human.remove(h)
            #     print(f'{h.name} account removed')
            if found:
                human.remove(found)
                print(f'{found.name} removed successfully')
            else:
                print('No human found with that name')
        elif ch == '4':
            yob = int(input('Enter the yob to find: '))
            results = [
                h for h in human
                if h.yob == yob
            ]
            if results and len(results) > 0:
                results[0].display()
            else:
                print(f'Student or Teacher with {yob} not found')
        elif ch == '5':
            print('Goodbye!')
            break
        else:
            print('Invalid choice, please enter 1-5')


# Press the green button in the gutter to run the script.
# if __name__ == '__main__':
#     print('PyCharm')
#     print()
if __name__ == '__main__':
    menu()
