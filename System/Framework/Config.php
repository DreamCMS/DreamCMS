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
 * @package     DreamCMS
 * @version     3.0.0 Beta
 * @category    Framework
 * @copyright	2008-2013 Marcel Domke
 * @license     http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author      Marcel Domke <http://www.dcms-studio.de>
 * @link        http://www.dcms-studio.de
 * @file        Config.php
 *
 */
class Config implements Countable, Iterator
{

    /**
     * Whether in-memory modifications to configuration data are allowed
     *
     * @var boolean
     */
    protected $_allowModifications;

    /**
     * Iteration index
     *
     * @var integer
     */
    protected $_index;

    /**
     * Contains which config file sections were loaded. This is null
     * if all sections were loaded, a string name if one section is loaded
     * and an array of string names if multiple sections were loaded.
     *
     * @var mixed
     */
    protected $_loadedSection;

    /**
     * Used when unsetting values during iteration to ensure we do not skip
     * the next element
     *
     * @var boolean
     */
    protected $_skipNextIteration;

    /**
     * Number of elements in configuration data
     *
     * @var integer
     */
    protected $_count;

    /**
     * Contains array of configuration data
     *
     * @var array
     */
    protected $_data = array();

    /**
     * This is used to track section inheritance. The keys are names of sections that
     * extend other sections, and the values are the extended sections.
     *
     * @var array
     */
    protected $_extends = array();

    /**
     * Config provides a property based interface to
     * an array. The data are read-only unless $allowModifications
     * is set to true on construction.
     *
     * Config also implements Countable and Iterator to
     * facilitate easy access to the data.
     *
     * @param  array   $array
     * @param  boolean $allowModifications
     * @return \Config
     */
    public function __construct( array $array, $allowModifications = false )
    {
        if ( !is_array( $array ) )
        {
            return;
        }
        $this->_allowModifications = (boolean) $allowModifications;
        $this->_data = array();

        foreach ( $array as $key => $value )
        {
            if ( is_array( $value ) )
            {
                $this->_data[ $key ] = new self( $value, $this->_allowModifications );
            }
            else
            {
                $this->_data[ $key ] = $value;
            }
        }

        $this->_count = count( $this->_data );
    }

    /**
     * Retrieve a value and return $default if there is no element set.
     *
     * @param string $name
     * @param mixed $default
     * @return mixed
     */
    public function get( $name, $default = null )
    {
        $result = $default;

        if ( isset( $this->_data[ $name ] ) )
        {
            $result = !empty( $this->_data[ $name ] ) ? $this->_data[ $name ] : $result;
        }

        return $result;
    }

    /**
     * Magic function so that $obj->value will work.
     *
     * @param string $name
     * @return mixed
     */
    public function __get( $name )
    {
        return $this->get( $name );
    }

    /**
     * Only allow setting of a property if $allowModifications
     * was set to true on construction. Otherwise, throw an exception.
     *
     * @param  string $name
     * @param  mixed  $value
     * @throws BaseException
     * @return void
     */
    public function __set( $name, $value )
    {


        if ( $this->_allowModifications )
        {

            if ( is_array( $value ) )
            {
                $this->_data[ $name ] = new self( $value, true );
            }
            else
            {
                $this->_data[ $name ] = $value;
            }


            $this->_count = count( $this->_data );
        }
        else
        {
            throw new BaseException( 'Config is read only' );
        }
    }

    /**
     * Deep clone of this instance to ensure that nested Configs
     * are also cloned.
     *
     * @return void
     */
    public function __clone()
    {
        $array = array();
        foreach ( $this->_data as $key => $value )
        {
            if ( $value instanceof Config )
            {
                $array[ $key ] = clone $value;
            }
            else
            {
                $array[ $key ] = $value;
            }
        }
        $this->_data = $array;
    }

    /**
     * Return an associative array of the stored data.
     *
     * @return array
     */
    public function toArray()
    {
        $array = array();
        $data = $this->_data;
        foreach ( $data as $key => $value )
        {
            if ( $value instanceof Config )
            {
                $array[ $key ] = $value->toArray();
            }
            else
            {
                $array[ $key ] = $value;
            }
        }
        return $array;
    }

    /**
     * Support isset() overloading on PHP 5.1
     *
     * @param string $name
     * @return boolean
     */
    public function __isset( $name )
    {
        return isset( $this->_data[ $name ] );
    }

    /**
     * Support unset() overloading on PHP 5.1
     *
     * @param  string $name
     * @throws BaseException
     * @return void
     */
    public function __unset( $name )
    {
        if ( $this->_allowModifications )
        {
            unset( $this->_data[ $name ] );
            $this->_count = count( $this->_data );
        }
        else
        {
            throw new BaseException( 'Config is read only' );
        }
    }

    /**
     * Merge another Config with this one. The items
     * in $merge will override the same named items in
     * the current config.
     *
     * @param Config $merge
     * @return Config
     */
    public function merge( Config $merge )
    {
        foreach ( $merge as $key => $item )
        {
            if ( array_key_exists( $key, $this->_data ) )
            {
                if ( $item instanceof Config && $this->$key instanceof Config )
                {
                    $this->$key = $this->$key->merge( new Config( $item->toArray(), !$this->readOnly() ) );
                }
                else
                {
                    $this->$key = $item;
                }
            }
            else
            {
                if ( $item instanceof Config )
                {
                    $this->$key = new Config( $item->toArray(), !$this->readOnly() );
                }
                else
                {
                    $this->$key = $item;
                }
            }
        }

        return $this;
    }

    /**
     * Prevent any more modifications being made to this instance. Useful
     * after merge() has been used to merge multiple Config objects
     * into one object which should then not be modified again.
     *
     */
    public function setReadOnly()
    {
        $this->_allowModifications = false;
        foreach ( $this->_data as $key => $value )
        {
            if ( $value instanceof Config )
            {
                $value->setReadOnly();
            }
        }
    }

    public function setWriteable()
    {
        $this->_allowModifications = true;
        foreach ( $this->_data as $key => $value )
        {
            if ( $value instanceof Config )
            {
                $value->setReadOnly();
            }
        }
    }

    /**
     * Returns if this Config object is read only or not.
     *
     * @return boolean
     */
    public function readOnly()
    {
        return !$this->_allowModifications;
    }

    /**
     * Merge two arrays recursively, overwriting keys of the same name
     * in $firstArray with the value in $secondArray.
     *
     * @param  mixed $firstArray  First array
     * @param  mixed $secondArray Second array to merge into first array
     * @return array
     */
    protected function _arrayMergeRecursive( $firstArray, $secondArray )
    {
        if ( is_array( $firstArray ) && is_array( $secondArray ) )
        {
            foreach ( $secondArray as $key => $value )
            {
                if ( isset( $firstArray[ $key ] ) )
                {
                    $firstArray[ $key ] = $this->_arrayMergeRecursive( $firstArray[ $key ], $value );
                }
                else
                {
                    if ( $key === 0 )
                    {
                        $firstArray = array(
                            0 => $this->_arrayMergeRecursive( $firstArray, $value ) );
                    }
                    else
                    {
                        $firstArray[ $key ] = $value;
                    }
                }
            }
        }
        else
        {
            $firstArray = $secondArray;
        }

        return $firstArray;
    }

    /**
     * Defined by Countable interface
     *
     * @return int
     */
    public function count()
    {
        return $this->_count;
    }

    /**
     * Defined by Iterator interface
     *
     * @return mixed
     */
    public function current()
    {
        $this->_skipNextIteration = false;
        return current( $this->_data );
    }

    /**
     * Defined by Iterator interface
     *
     * @return mixed
     */
    public function key()
    {
        return key( $this->_data );
    }

    /**
     * Defined by Iterator interface
     *
     */
    public function next()
    {
        if ( $this->_skipNextIteration )
        {
            $this->_skipNextIteration = false;
            return;
        }
        next( $this->_data );
        $this->_index++;
    }

    /**
     * Defined by Iterator interface
     *
     */
    public function rewind()
    {
        $this->_skipNextIteration = false;
        reset( $this->_data );
        $this->_index = 0;
    }

    /**
     * Defined by Iterator interface
     *
     * @return boolean
     */
    public function valid()
    {
        return $this->_index < $this->_count;
    }

}

?>