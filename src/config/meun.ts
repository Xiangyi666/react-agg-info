export default [
  {
    id: '1',
    name: 'Search',
    route: '/mainSearch',
  },
  {
    id: '2',
    name: 'Chat',
    route: '/chat',
    children: [
      {id: '2-1', name: 'Chat', route: '/chat'},
      {id: '2-2', name: 'Asda', route: '/edit'},
      {id: '2-3', name: 'VDD', route: '/edit'},
    ]
  },
]
