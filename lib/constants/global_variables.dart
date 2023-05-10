import 'package:flutter/material.dart';

String uri = 'server-coursework.onrender.com';

class GlobalVariables {
  // COLORS
  static const appBarGradient = LinearGradient(
    colors: [
      Color.fromARGB(255, 29, 201, 192),
      Color.fromARGB(255, 125, 221, 216),
    ],
    stops: [0.5, 1.0],
  );

  static const secondaryColor = Color.fromRGBO(255, 153, 0, 1);
  static const backgroundColor = Colors.white;
  static const Color greyBackgroundCOlor = Color(0xffebecee);
  static var selectedNavBarColor = Colors.cyan[800]!;
  static const unselectedNavBarColor = Colors.black87;

  // STATIC IMAGES
  static const List<String> carouselImages = [
    'https://www.ixbt.com/img/n1/news/2019/2/1/gsmarena_001.jpg',
    'https://avatars.mds.yandex.net/i?id=ffce94bbf6d27be5fbf507cb90c4a0eea757ae3e-8539554-images-thumbs&n=13',
    'https://muizre.ru/_dr/85/19127267.jpg',
    'https://www.sostav.ru/images/news/2021/09/07/cnyzf0vl.png',
    'https://i.pinimg.com/originals/d3/d1/74/d3d174396dfc1b4cee0251b7ae2d399b.jpg',
  ];

  static const List<Map<String, String>> categoryImages = [
    {
      'title': 'Mobiles',
      'image': 'assets/images/mobiles.webp',
    },
    {
      'title': 'Essentials',
      'image': 'assets/images/essentials.png',
    },
    {
      'title': 'Appliances',
      'image': 'assets/images/appliances.png',
    },
    {
      'title': 'Books',
      'image': 'assets/images/books.png',
    },
    {
      'title': 'Fashion',
      'image': 'assets/images/fashion.png',
    },
  ];
}
