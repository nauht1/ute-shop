import React, { useEffect, useState } from 'react';
import logo from '../../assets/images/logo.png'
// import { TbLockAccess, TbLockAccessOff } from 'react-icons/tb'
// import { SiAwssecretsmanager } from "react-icons/si";
import { BiSearch } from 'react-icons/bi';
import { BsMenuButtonWideFill } from 'react-icons/bs';
import { RiCopperCoinLine } from "react-icons/ri";
import { FaQuestionCircle, FaRegUserCircle } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/reducers/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import Menu from '../menu/Menu';
import Notification from '../socket/Notification';
import { AnimatePresence, motion } from 'framer-motion';
import { useWebSocket } from '../../context/WebSocketContext';
import { fetchWallet } from '../../redux/reducers/walletSlice';
import { LuWallet } from 'react-icons/lu';
import { getUserCart } from '../../apis/cart';
import { setItems } from '../../redux/reducers/cartSlice';
import { BASE_URL } from '../../apis/base';

const Navbar = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  // const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openNoti, setOpenNoti] = useState(false);
  const [openAcc, setOpenAcc] = useState(false);
  const { unreadCount, fetchNotifications, clearNotifications } = useWebSocket();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const walletBalance = useSelector((state: RootState) => state.wallet.balance);
  const [openWallet, setOpenWallet] = useState(false);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setIsVisible(!isVisible); // Toggle visibility when clicking on the category
  };
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // const isAdmin = true;
  // const user = useSelector((state: RootState) => state.auth.user);
  const role = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWallet());
    }
  }, [isAuthenticated, dispatch]);

  // Fix temporary
  useEffect(() => {
    const fetchCart = async () => {
      try{
        const response = await getUserCart();
        const cartItems = response.data.map((item:any) => ({
          id: item.book.id,
          title: item.book.title,
          price: parseFloat(item.book.price),
          salePrice: item.book.salePrice ? parseFloat(item.book.salePrice) : undefined,
          image: item.book.cover_img_url,
          stars: item.book.stars || 0,
          age: item.book.age || '',
          publisher: item.book.publisher || '',
          quantity: item.quantity,
          stock: item.book.stock,
          checked: item.checked,
        }));
        dispatch(setItems(cartItems));
      } catch(error){
        console.error("Failed to fetch cart:", error);
      }
    };
    fetchCart();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      const response = await fetch(BASE_URL + '/auth/logout', {
        method: 'POST',
        credentials: 'include', // Gửi cookie kèm theo
      });

      if (response.ok) {
        // Nếu logout thành công, cập nhật trạng thái trong Redux
        dispatch(logout());
        localStorage.clear();
        clearNotifications();
        // alert('Đăng xuất thành công!');
        // Có thể điều hướng về trang đăng nhập hoặc trang chủ
        navigate('/login');
      } else {
        alert('Đăng xuất thất bại!');
      }
    } catch (err) {
      console.error('Có lỗi xảy ra khi đăng xuất:', err);
    }
  };

  // Extract search query from the URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';

  useEffect(() => {
    setSearchQuery(query); // Initialize search input with query parameter
  }, [query]);
  
  const handleSearch = () => {
    // if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery.trim()}&page=1`);
    // }
    // else {
    //   navigate(`/search?query`);
    // }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  useEffect(() => {
    fetchNotifications(10, 0);
    localStorage.setItem('notificationOffset', '0');
  }, []);

  return (
    // navbar using tailwindcss
    <>
      <nav className="bg-gray-800 p-2 sticky top-0 z-30">
        <div className="justify-between mx-auto flex items-center">
          <div className='justify-between flex items-center gap-10'>
            <Link to="/">
              <img className='w-20 ml-5' src={logo} alt="" />
            </Link>
            <BsMenuButtonWideFill onClick={() => handleCategoryClick('Sách trong nước')} size={30} className='mr-2' color='white' />
            {/* searchBox */}
            <div className="flex items-center w-100">
              <input
                type="text"
                placeholder="Nhập sách cần tìm"
                className="bg-white p-1 h-8 rounded-l-lg w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown} />
              <button onClick={handleSearch} className="bg-white p-1 h-8 rounded-r-lg"><BiSearch size={24} /></button>
            </div>
          </div>
          <div className="flex items-center">
            <ul className="flex space-x-4">
              <li><Link to="/" className="text-white hover:text-violet-700">Trang chủ</Link></li>
              <li><Link to="/book" className="text-white hover:text-violet-700">Sách</Link></li>
              <li><Link to="/publisher" className="text-white hover:text-violet-700">Nhà xuất bản</Link></li>
            </ul>
          </div>
          <div>
            {isAuthenticated ? (
              <div>
                <ul className="flex space-x-4 items-center">
                  <li
                    className='text-white hover:text-violet-700 cursor-pointer relative'
                    onMouseEnter={() => setOpenWallet(true)}
                    onMouseLeave={() => setOpenWallet(false)}
                  >
                    <LuWallet size={24} className='inline-block mr-2' />
                    <AnimatePresence>
                    {openWallet && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 8 }}
                        exit={{ opacity: 0, y: 15 }}
                        style={{ translateX: "-50%", willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-5 bg-white rounded-lg shadow-lg group-hover:block" 
                      >
                        <div className="w-48 py-2 px-2 text-gray-800">
                          Số dư: {walletBalance}
                          <RiCopperCoinLine className='inline-block mb-1 ml-1'/>

                          <div className='text-rose-700 text-sm'>1 <RiCopperCoinLine className='inline-block mb-1' /> = 100 VND </div>
                          <hr className='my-2' />
                          <div className='text-rose-700 text-sm'><FaQuestionCircle className='inline-block mb-1 mr-1' size={16} />20k VNĐ đã tiêu = 1 <RiCopperCoinLine className='inline-block mb-1' /></div>
                        </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                    
                  </li>
                  <li>
                    {/* Notification Icon with Dropdown */}
                    <div
                      onMouseEnter={() => {
                        setOpenNoti(true);
                      }}
                      onMouseLeave={() => {
                        setOpenNoti(false);
                      }}
                      className="relative group w-fit h-fit py-2 cursor-pointer"
                    >
                      <IoMdNotificationsOutline size={34} className='text-white group-hover:text-violet-700' />

                      {/* Unread notification count */}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white rounded-full text-sm flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                      <AnimatePresence>
                        {openNoti && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 8 }}
                            exit={{ opacity: 0, y: 15 }}
                            style={{ translateX: "-90%", willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right rounded-lg shadow-lg group-hover:block"
                          >
                            <Notification />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                  <li className='relative'>
                    <Link to="/cart" className="text-white">
                      <div className="py-2">
                        <FiShoppingCart size={34} className='hover:text-violet-700' />
                        {cartItems.length > 0 && (
                          <span className="absolute -top-1 -right-3 h-5 w-5 bg-red-600 text-white rounded-full text-sm flex items-center justify-center">
                          {cartItems.length}
                        </span>
                        )}
                      </div>
                    </Link>
                  </li>
                  {/* User icon with dropdown menu */}
                  <li className="relative group">
                    <div
                      onMouseEnter={() => {
                        setOpenAcc(true);
                      }}
                      onMouseLeave={() => {
                        setOpenAcc(false);
                      }}
                      className="relative group w-fit h-fit py-2 cursor-pointer"
                    >
                      <FaRegUserCircle size={34} className='text-white group-hover:text-violet-700' />
                      <AnimatePresence>
                        {openAcc && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 8 }}
                            exit={{ opacity: 0, y: 15 }}
                            style={{ translateX: "-50%", willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 bg-white rounded-lg shadow-lg group-hover:block"
                          >
                            {/* Dropdown menu */}
                            <div className="absolute right-0 w-48 backdrop-blur-md bg-white rounded-lg shadow-lg group-hover:block">
                              <Link to="/account/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-t-lg">
                                Tài khoản của tôi
                              </Link>
                              <Link to="/account/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                                Đơn hàng của tôi
                              </Link>
                              <Link to="/account/favoriteBooks" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                                Sách yêu thích
                              </Link>
                              {role === 'admin' && (
                                <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                                  Admin Management
                                </Link>
                              )}
                              <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-rose-600 font-bold hover:bg-gray-200 rounded-md"
                              >
                                Đăng xuất
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="bg-white text-purple-600 border border-purple-600 px-4 py-2 rounded-md hover:bg-purple-600 hover:text-white transition duration-300">
                  Login
                </Link>
                <Link to="/register" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        <Menu activeCategory={activeCategory} isVisible={isVisible} />
      </nav>


    </>
  )
}

export default Navbar
