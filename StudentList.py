from pymongo import MongoClient
from Student import Student


class StudentList:
    def __init__(self):
        self.client = MongoClient('mongodb://localhost:27017')
        self.db = self.client['school_db']
        self.collection = self.db['students']

    def add(self):
        student = Student()
        student.input_data()

        if self.collection.find_one({'student_id': student.student_id}):
            print(f'Student ID {student.student_id} already exists! Cannot add.')
            return

        self.collection.insert_one(student.to_dict())
        print(f'Student {student.name} added successfully!')

    def display(self):
        students = self.collection.find()
        count = 0
        for s in students:
            student_obj = Student.from_dict(s)
            student_obj.display()
            count += 1
        if count == 0:
            print('No students to display.')

    def remove(self):
        student_id = input('Student ID to remove: ').strip().upper()
        result = self.collection.delete_one({'student_id': student_id})
        if result.deleted_count:
            print(f'Student {student_id} deleted successfully!')
        else:
            print(f'No student with ID {student_id} found!')

    def search(self):
        major_keyword = input('Major to search: ').strip()
        major_query = {'major': {'$regex': major_keyword, '$options': 'i'}}
        students = list(self.collection.find(major_query))
        if students:
            for s in students:
                student_obj = Student.from_dict(s)
                student_obj.display()
        else:
            print(f'No student with major containing "{major_keyword}" found!')