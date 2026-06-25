from Human import Human

class Teacher (Human):
    def __init__(self, name='', yob:int=0, yoe: int=0):
        super.__init__(name,yob)
        self.yoe = yoe

    def input(self):
        super().input()
        self.yoe = int(input('Please input your year of experience (0-60): '))

    def display(self):
        print(f"Teacher [Name: {self.name}, Year of Birth: {self.yob}, Year of Experience: {self.yoe}")

    def to_dict(self):
        return {
            "type" : self.__class__.__name__,
            "name" : self.name,
            "yob" : self.yob,
            "yoe" : self.yoe
        }