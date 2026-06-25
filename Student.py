from  Human import Human

class Student (Human):
    def __init__(self, name='', yob:int=0, mark: int=0):
        super.__init__(name,yob)
        self.mark = mark

    def input(self):
        super().input()
        self.mark = int(input('Please input your mark: '))

    def display(self):
        print(f"Student [Name: {self.name}, Year of Birth: {self.yob}, Mark: {self.mark}")

    def to_dict(self):
        return {
            "type" : self.__class__.__name__,
            "name" : self.name,
            "yob" : self.yob,
            "mark" : self.mark
        }
