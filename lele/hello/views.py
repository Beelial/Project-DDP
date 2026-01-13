from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'landing.html')

def tentang(request):
    return render(request, 'tentang.html')

def produk(request):
    return render(request, 'produk.html')

def login(request):
    return render(request, 'login.html')

def register(request):
    return render(request, 'register.html')
