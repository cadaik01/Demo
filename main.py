from pymongo import MongoClient, results


class Student:
    def __init__(self, student_id: str = '', name: str = '', major: str = '', gpa: float = 0.0):
        self.student_id = student_id
        self.name = name
        self.major = major
        self.gpa = gpa

    def input_data(self):
        self.student_id = input('Student ID: ')
        self.name = input('Name: ')
        self.major = input('Major: ')
        self.gpa = float(input('GPA: '))

    def to_dict(self):
        return {
            'student_id': self.student_id,
            'name': self.name,
            'major': self.major,
            'gpa': self.gpa
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            data['student_id'],
            data['name'],
            data['major'],
            data['gpa']
        )

    def display(self):
        print(self)

    def remove(self):
        self.student_id = input('Student ID: ')
        result = self.collection.delete_one({'student_id': self.student_id})
        if result.deleted_count:
            print(f'Student {result.deleted_count} deleted successfully!')
        else:
            print(f'No student with ID {self.student_id} deleted successfully!')

    def search(self):
        major_query = {'major': self.major}
        students = self.collection.find(major_query)
        if students:
            for s in students:
                student_obj = Student.from_dict(s)
                print(student_obj)
        else:
            print(f'No student with major: {self.major} deleted successfully!')



    def __str__(self):
        return f'{self.student_id} {self.name} {self.major} {self.gpa}'


class StudentList:
    def __init__(self):
        self.client = MongoClient('mongodb://localhost:27017')
        self.db = self.client['school_db']
        self.collection = self.db['students']

    def add(self):
        student = Student()
        student.input_data()
        self.collection.insert_one(student.to_dict())
        print(f'Student {student.name} added successfully!')

    def display_all(self):
        students = self.collection.find()
        for s in students:
            student_obj = Student.from_dict(s)
            student_obj.display()


def menu():
    student_list = StudentList()
    while True:
        print('1. Add Student')
        print('2. Display All Students')
        print('3. Exit')
        ch = input('Input choice (1-3): ')
        if ch == '1':
            student_list.add()
        elif ch == '2':
            student_list.display_all()
        elif ch == '3':
            print('Goodbye!')
            break
        else:
            print('Invalid choice')


if __name__ == '__main__':
    menu()