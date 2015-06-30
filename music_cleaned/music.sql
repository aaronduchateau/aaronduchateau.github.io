-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jul 20, 2014 at 11:54 PM
-- Server version: 5.5.16
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `music`
--

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

CREATE TABLE IF NOT EXISTS `albums` (
  `id` int(2) DEFAULT NULL,
  `title` varchar(31) DEFAULT NULL,
  `group` varchar(14) DEFAULT NULL,
  `release_date` varchar(9) DEFAULT NULL,
  `no_of_discs` int(1) DEFAULT NULL,
  `wiki_link` varchar(72) DEFAULT NULL,
  `recording_date` varchar(10) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `albums`
--

INSERT INTO `albums` (`id`, `title`, `group`, `release_date`, `no_of_discs`, `wiki_link`, `recording_date`) VALUES
(1, 'Absent Lovers: Live in Montreal', 'King Crimson', '6/23/98', 2, 'http://en.wikipedia.org/wiki/Absent_Lovers:_Live_in_Montreal', '7/11/84'),
(2, 'B''Boom: Live in Argentina', 'King Crimson', '8/22/95', 2, 'http://en.wikipedia.org/wiki/B%27Boom:_Live_in_Argentina', ''),
(3, 'The Beat Club: Bremen', 'King Crimson', '2/1/99', 1, 'http://en.wikipedia.org/wiki/The_Beat_Club,_Bremen', '10/17/72'),
(4, 'Earthbound', 'King Crimson', '6/9/72', 1, 'http://en.wikipedia.org/wiki/Earthbound_(King_Crimson_album)', ''),
(5, 'Elektrik: Live in Japan', 'King Crimson', '10/1/03', 1, 'http://en.wikipedia.org/wiki/EleKtrik:_Live_in_Japan', '4/16/03'),
(6, 'Epitaph', 'King Crimson', '1/13/97', 4, 'http://en.wikipedia.org/wiki/Epitaph_(King_Crimson_album)', ''),
(7, 'The Great Deceiver', 'King Crimson', '10/30/92', 4, 'http://en.wikipedia.org/wiki/The_Great_Deceiver_(King_Crimson_album)', ''),
(8, 'Live at Plymouth Guildhall', 'King Crimson', '12/1/00', 2, 'http://en.wikipedia.org/wiki/King_Crimson_Live_at_Plymouth_Guildhall', '5/11/71'),
(9, 'Live at Summit Studios', 'King Crimson', '2/1/00', 1, 'http://en.wikipedia.org/wiki/King_Crimson_Live_at_Summit_Studios', '3/12/72'),
(10, 'Live in Hyde Park, London', 'King Crimson', '7/1/02', 1, 'http://en.wikipedia.org/wiki/King_Crimson_Live_in_Hyde_Park,_London', '7/5/69'),
(11, 'Live in Mainz', 'King Crimson', '2/1/01', 1, 'http://en.wikipedia.org/wiki/King_Crimson_Live_in_Mainz', '3/30/74'),
(12, 'On Broadway', 'King Crimson', '6/1/99', 2, 'http://en.wikipedia.org/wiki/King_Crimson_on_Broadway', ''),
(13, 'Ladies of the Road', 'King Crimson', '11/12/02', 2, 'http://en.wikipedia.org/wiki/Ladies_of_the_Road', ''),
(14, 'Level Five', 'King Crimson', '11/9/01', 1, 'http://en.wikipedia.org/wiki/Level_Five_(EP)', ''),
(15, 'Live at Cap D''Adge', 'King Crimson', '4/1/99', 1, 'http://en.wikipedia.org/wiki/Live_at_Cap_D%27Agde', ''),
(16, 'Live at Fillmore East', 'King Crimson', '2/1/04', 1, 'http://en.wikipedia.org/wiki/Live_at_Fillmore_East_(King_Crimson_album)', ''),
(17, 'Live in Jacksonville', 'King Crimson', '12/1/98', 1, 'http://en.wikipedia.org/wiki/Live_at_Jacksonville', '2/26/72'),
(18, 'Live at Moles Club', 'King Crimson', '6/1/00', 1, 'http://en.wikipedia.org/wiki/Live_at_Moles_Club,_Bath', ''),
(19, 'Live at the Jazz Caf', 'ProjeKct One', '12/1/98', 1, 'http://en.wikipedia.org/wiki/Live_at_the_Jazz_Caf%C3%A9', ''),
(20, 'Live at the Marquee', 'King Crimson', '10/1/98', 1, 'http://en.wikipedia.org/wiki/Live_at_the_Marquee_(King_Crimson_album)', ''),
(21, 'Live at the Zoom Club', 'King Crimson', '5/1/02', 2, 'http://en.wikipedia.org/wiki/Live_at_the_Zoom_Club', ''),
(22, 'Live in Austin', 'ProjeKct Three', '10/1/04', 1, 'http://en.wikipedia.org/wiki/Live_in_Austin,_TX_(ProjeKct_Three_album)', '3/25/99'),
(23, 'Live in Berkeley', 'King Crimson', '5/1/01', 1, 'http://en.wikipedia.org/wiki/Live_in_Berkeley,_CA', '8/13/82'),
(24, 'Live in Brighton', 'King Crimson', '2/1/05', 2, 'http://en.wikipedia.org/wiki/Live_in_Brighton', '10/16/71'),
(25, 'Live in Central Park', 'King Crimson', '4/1/00', 1, 'http://en.wikipedia.org/wiki/Live_in_Central_Park,_NYC', '4/1/74'),
(26, 'Live in Detroit', 'King Crimson', '10/1/01', 2, 'http://en.wikipedia.org/wiki/Live_in_Detroit,_MI', '11/13/71'),
(27, 'Live in Guildford', 'King Crimson', '10/1/03', 1, 'http://en.wikipedia.org/wiki/Live_in_Guildford', '11/13/72'),
(28, 'Live in Heidelberg', 'King Crimson', '9/1/04', 1, 'http://en.wikipedia.org/wiki/Live_in_Heidelberg', '3/29/74'),
(29, 'Live in Nashville', 'King Crimson', '2/1/02', 1, 'http://en.wikipedia.org/wiki/Live_in_Nashville,_TN', '11/9/01'),
(30, 'Live in Northampton', 'ProjeKct Two', '6/1/01', 1, 'http://en.wikipedia.org/wiki/Live_in_Northampton,_MA', '4/1/98'),
(31, 'Live in Orlando', 'King Crimson', '6/1/03', 2, 'http://en.wikipedia.org/wiki/Live_in_Orlando,_FL', '2/27/72'),
(32, 'Live in Philadelphia', 'King Crimson', '5/1/04', 1, 'http://en.wikipedia.org/wiki/Live_in_Philadelphia,_PA', '7/30/82'),
(33, 'Live in San Francisco', 'ProjeKct Four', '8/1/99', 1, 'http://en.wikipedia.org/wiki/Live_in_San_Francisco_(ProjeKct_Four_album)', '11/1/98'),
(34, 'Live in Warsaw', 'King Crimson', '6/1/05', 2, 'http://en.wikipedia.org/wiki/Live_in_Warsaw,_Poland', '6/11/00'),
(35, 'Masque', 'ProjeKct Three', '8/18/99', 1, 'http://en.wikipedia.org/wiki/Masque_(King_Crimson_album)', ''),
(36, 'The Night Watch', 'King Crimson', '6/20/97', 2, 'http://en.wikipedia.org/wiki/The_Night_Watch_(album)', '11/23/73'),
(37, 'Thrakattak', 'King Crimson', '5/21/96', 1, 'http://en.wikipedia.org/wiki/Thrakattak', ''),
(38, 'USA', 'King Crimson', '5/3/75', 2, 'http://en.wikipedia.org/wiki/USA_(album)', '6/28/74'),
(39, 'VROOOM VROOOM', 'King Crimson', '11/13/01', 2, 'http://en.wikipedia.org/wiki/Vrooom_Vrooom', '');

-- --------------------------------------------------------

--
-- Table structure for table `albums_personnel`
--

CREATE TABLE IF NOT EXISTS `albums_personnel` (
  `album_id` int(2) DEFAULT NULL,
  `personnel_id` int(2) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `albums_personnel`
--

INSERT INTO `albums_personnel` (`album_id`, `personnel_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(3, 1),
(3, 4),
(3, 7),
(3, 8),
(3, 9),
(4, 1),
(4, 10),
(4, 11),
(4, 12),
(5, 1),
(5, 2),
(5, 5),
(5, 6),
(6, 1),
(6, 13),
(6, 14),
(6, 15),
(6, 16),
(7, 1),
(7, 4),
(7, 7),
(7, 8),
(8, 1),
(8, 10),
(8, 11),
(8, 12),
(8, 16),
(9, 1),
(9, 10),
(9, 11),
(9, 12),
(10, 1),
(10, 13),
(10, 14),
(10, 15),
(10, 16),
(11, 1),
(11, 4),
(11, 7),
(11, 8),
(12, 1),
(12, 2),
(12, 3),
(12, 4),
(12, 5),
(12, 6),
(13, 1),
(13, 10),
(13, 11),
(13, 12),
(14, 1),
(14, 2),
(14, 5),
(14, 6),
(15, 1),
(15, 2),
(15, 3),
(15, 4),
(16, 1),
(16, 13),
(16, 14),
(16, 15),
(16, 16),
(17, 1),
(17, 10),
(17, 11),
(17, 12),
(18, 1),
(18, 2),
(18, 3),
(18, 4),
(19, 1),
(19, 3),
(19, 4),
(19, 5),
(20, 1),
(20, 13),
(20, 14),
(20, 15),
(20, 16),
(21, 1),
(21, 4),
(21, 7),
(21, 8),
(21, 9),
(22, 1),
(22, 5),
(22, 6),
(23, 1),
(23, 2),
(23, 3),
(23, 4),
(24, 1),
(24, 10),
(24, 11),
(24, 12),
(24, 16),
(25, 1),
(25, 4),
(25, 7),
(25, 8),
(26, 1),
(26, 10),
(26, 11),
(26, 12),
(26, 16),
(27, 1),
(27, 4),
(27, 7),
(27, 8),
(27, 9),
(28, 1),
(28, 4),
(28, 7),
(28, 8),
(29, 1),
(29, 2),
(29, 5),
(29, 6),
(30, 1),
(30, 2),
(30, 5),
(31, 1),
(31, 10),
(31, 11),
(31, 12),
(32, 1),
(32, 2),
(32, 3),
(32, 4),
(33, 1),
(33, 3),
(33, 5),
(33, 6),
(34, 1),
(34, 2),
(34, 5),
(34, 6),
(35, 1),
(35, 5),
(35, 6),
(36, 1),
(36, 4),
(36, 7),
(36, 8),
(37, 1),
(37, 2),
(37, 3),
(37, 4),
(37, 5),
(37, 6),
(38, 1),
(38, 4),
(38, 7),
(38, 8),
(39, 1),
(39, 2),
(39, 3),
(39, 4),
(39, 5),
(39, 6);

-- --------------------------------------------------------

--
-- Table structure for table `personnel`
--

CREATE TABLE IF NOT EXISTS `personnel` (
  `id` int(2) DEFAULT NULL,
  `given_name` varchar(7) DEFAULT NULL,
  `surname` varchar(10) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `personnel`
--

INSERT INTO `personnel` (`id`, `given_name`, `surname`) VALUES
(1, 'Robert', 'Fripp'),
(2, 'Adrian', 'Belew'),
(3, 'Tony', 'Levin'),
(4, 'Bill', 'Bruford'),
(5, 'Trey', 'Gunn'),
(6, 'Pat', 'Mastelotto'),
(7, 'John', 'Wetton'),
(8, 'David', 'Cross'),
(9, 'Jamie', 'Muir'),
(10, 'Mel', 'Collins'),
(11, 'Boz', 'Burrell'),
(12, 'Ian', 'Wallace'),
(13, 'Michael', 'Giles'),
(14, 'Ian', 'McDonald'),
(15, 'Greg', 'Lake'),
(16, 'Peter', 'Sinfield');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
