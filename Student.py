from pymongo import MongoClient


class Student:
    def __init__(self, student_id: str = '', name: str = '', major: str = '', gpa: float = 0.0):
        self.student_id = student_id
        self.name = name
        self.major = major
        self.gpa = gpa

    def input_data(self):
        while True:
            student_id = input('Student ID (format SXXX, e.g. S101): ').strip().upper()
            if len(student_id) >= 4 and student_id[0] == 'S' and student_id[1:].isdigit():
                self.student_id = student_id
                break
            print('Invalid Student ID! Must be in format SXXX, e.g. S101.')

        while True:
            name = input('Name: ').strip()
            if name:
                self.name = name
                break
            print('Name must not be empty!')

        while True:
            major = input('Major: ').strip()
            if major:
                self.major = major
                break
            print('Major must not be empty!')

        while True:
            try:
                gpa = float(input('GPA (0.0 - 4.0): '))
                if 0.0 <= gpa <= 4.0:
                    self.gpa = gpa
                    break
                else:
                    print('GPA must be between 0.0 and 4.0!')
            except ValueError:
                print('Invalid input! Please enter a number.')

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

    def __str__(self):
        return (f'[{self.student_id}] Name: {self.name}, '
                f'Major: {self.major}, GPA: {self.gpa:.2f}')