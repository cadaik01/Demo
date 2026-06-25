from StudentList import StudentList


def menu():
    student_list = StudentList()
    while True:
        print('1. Add a new student')
        print('2. Display all students')
        print('3. Remove a student by ID')
        print('4. Search for students by major')
        print('5. Exit')
        ch = input('Input choice (1-5): ')
        if ch == '1':
            student_list.add()
        elif ch == '2':
            student_list.display()
        elif ch == '3':
            student_list.remove()
        elif ch == '4':
            student_list.search()
        elif ch == '5':
            print('Goodbye!')
            break
        else:
            print('Invalid choice')


if __name__ == '__main__':
    menu()