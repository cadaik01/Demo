from abc import ABC, abstractmethod
from datetime import datetime

class Human(ABC):
    def __init__(self, name: str = '', yob: int = 0):
        self.name = name
        self.yob = yob

    def input(self):
        self.name = input("Input your name: ")
        while True:
            try:
                yob = int(input("Input your year of birth: "))
                if Human.is_valid_yob(yob):
                    self.yob = yob
                    break
                else:
                    print("Year of birth invalid!")
            except ValueError:
                print("Invalid input!!")

    @abstractmethod
    def display(self):
        pass

    @abstractmethod
    def from_dict(cls, data:{__getitem__}):
        from Student import Student
        from Teacher import Teacher

        h_type = data['type']
        if h_type == 'Student':
            return Student(data['name'], int(data['yob']),int(data['mark']))
        elif h_type == 'Teacher':
            return Teacher(data['name'], int(data['yob']), int(data['yoe']))
        return None

    @staticmethod
    def is_valid_yob(yob: int):
        current_year = datetime.now().year
        return yob <= current_year - 18