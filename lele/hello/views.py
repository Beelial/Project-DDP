from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import CartItem, Order, OrderItem

# Create your views here.
def home(request):
    return render(request, 'landing.html')

def tentang(request):
    return render(request, 'tentang.html')

def produk(request):
    return render(request, 'produk.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Email atau Password salah!')
    return render(request, 'login.html')

def register(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')

        if password != password2:
            messages.error(request, 'Password tidak sama!')
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request,  'Username sudah terdaftar!')
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request,  'Email sudah digunakan!')
            return redirect('register')

        User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        messages.success(request, 'Registrasi berhasil, silahkan login')
        return redirect('login')
    return render(request, 'register.html')

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def edit_profile_view(request):
    user = request.user

    if request.method == 'POST':
        new_username = request.POST.get('username', '').strip().lower()
        new_email = request.POST.get('email', '').strip().lower()

        if not new_username or not new_email:
            messages.error(request, 'Username dan email tidak boleh kosong')
            return redirect('edit_profile')

        if User.objects.exclude(id=user.id).filter(username__iexact=new_username).exists():
            messages.error(request, 'Username sudah digunakan orang lain')
            return redirect('edit_profile')

        if User.objects.exclude(id=user.id).filter(email__iexact=new_email).exists():
            messages.error(request, 'Email sudah digunakan orang lain')
            return redirect('edit_profile')

        user.username = new_username
        user.email = new_email

        new_password = None
        if request.POST.get('change_password'):
            new_password = request.POST.get('new_password', '').strip()
            confirm_password = request.POST.get('confirm_password', '').strip()

            if new_password != confirm_password:
                messages.error(request, 'Password tidak sama')
                return redirect('edit_profile')

            if new_password:
                user.set_password(new_password)

        user.save()

        if new_password:
            from django.contrib.auth import update_session_auth_hash
            update_session_auth_hash(request, user)

        messages.success(request, 'Profil berhasil diperbarui')
        return render(request, 'edit_profile.html', {'redirect_home': True})

    return render(request, 'edit_profile.html')


@login_required
def payment_history(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'payment_history.html', {'orders': orders})


@login_required
def process_payment(request):
    if request.method == 'POST':
        method = request.POST.get('method')

        cart_items = CartItem.objects.filter(user=request.user)

        if not cart_items.exists():
            return redirect('produk')

        total = sum(item.price * item.quantity for item in cart_items)

        order = Order.objects.create(
            user=request.user,
            total=total,
            method=method,
            status='BERHASIL'
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_name=item.name,
                price=item.price,
                quantity=item.quantity
            )

        cart_items.delete()

        return redirect('payment_result', order_id=order.id)

@login_required
def payment_result(request, order_id):
    order = Order.objects.get(id=order_id, user=request.user)
    return render(request, 'payment_result.html', {
        'order': order
    })



@login_required
def cart_list(request):
    items = CartItem.objects.filter(user=request.user)

    data = []
    total = 0

    for item in items:
        subtotal = item.price * item.quantity
        total += subtotal

        data.append({
            'id': item.id,
            'name': item.name,
            'price': item.price,
            'quantity': item.quantity,
            'image': item.image.url if hasattr(item, 'image') and item.image else ''
        })


    return JsonResponse({
        'items': data,
        'total': total
    })


@login_required
def cart_add(request):
    data = json.loads(request.body)

    item, created = CartItem.objects.get_or_create(
        user=request.user,
        name=data['name'],
        defaults={
            'price': int(data['price']),
            'quantity': 1
        }
    )

    if not created:
        item.quantity += 1
        item.save()

    return JsonResponse({'success': True})

@login_required
def cart_update(request):
    data = json.loads(request.body)

    item = CartItem.objects.get(
        id=data['id'],
        user=request.user
    )

    qty = data['quantity']

    if qty <= 0:
        item.delete()
        total = sum(
            i.price * i.quantity
            for i in CartItem.objects.filter(user=request.user)
        )
        return JsonResponse({
            'deleted': True,
            'total': total
        })

    item.quantity = qty
    item.save()



    total = sum(
        i.price * i.quantity
        for i in CartItem.objects.filter(user=request.user)
    )

    return JsonResponse({
        'quantity': item.quantity,
        'subtotal': item.price * item.quantity,
        'total': total
    })
