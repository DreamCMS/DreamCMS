<?php

/**
 * DreamCMS 3.0
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 * 
 * PHP Version 5
 *
 * @package     utf8
 * @version     3.0.0 Beta
 * @category    UTF-8 Tools
 * @copyright	2008-2013 Marcel Domke
 * @license     http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author      Marcel Domke <http://www.dcms-studio.de>
 * @link        http://www.dcms-studio.de
 * @file        strrpos.php
 */
defined( 'ROOT_PATH' ) or die( 'No direct script access.' );

/**
 * UTF8::strrpos
 *
 * @package    Kohana
 * @author     Kohana Team
 * @copyright  (c) 2007-2011 Kohana Team
 * @copyright  (c) 2005 Harry Fuecks
 * @license    http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt
 */
function _strrpos( $str, $search, $offset = 0 )
{
    $offset = ( int ) $offset;

    if ( UTF8::is_ascii( $str ) AND UTF8::is_ascii( $search ) )
        return strrpos( $str, $search, $offset );

    if ( $offset == 0 )
    {
        $array = explode( $search, $str, -1 );
        return isset( $array[ 0 ] ) ? UTF8::strlen( implode( $search, $array ) ) : FALSE;
    }

    $str = UTF8::substr( $str, $offset );
    $pos = UTF8::strrpos( $str, $search );
    return ($pos === FALSE) ? FALSE : ($pos + $offset);
}
