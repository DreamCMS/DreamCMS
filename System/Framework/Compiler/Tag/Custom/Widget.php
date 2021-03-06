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
 * @package      
 * @version      3.0.0 Beta
 * @category     
 * @copyright    2008-2014 Marcel Domke
 * @license      http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author       Marcel Domke <http://www.dcms-studio.de>
 * @link         http://www.dcms-studio.de
 * @file         Widget.php
 */

class Compiler_Tag_Custom_Widget extends Compiler_Tag_Abstract
{

	/**
	 *
	 */
	public function configure()
	{
		$this->tag->setAttributeConfig(
			array(
			     'name'   => array(
				     Compiler_Attribute::REQUIRED,
				     Compiler_Attribute::STRING ),
			     'method' => array(
				     Compiler_Attribute::REQUIRED,
				     Compiler_Attribute::STRING )
			)
		);
	}

	/**
	 *
	 * @return void
	 */
	public function process()
	{
		if ( $this->tag->isEndTag() )
		{
			return;
		}


		$name = $this->getAttributeValue( 'name' );
		$method = $this->getAttributeValue( 'method' );


		$_extra = array();


		$attributes = & $this->tag->getAttributes();
		if ( is_array( $attributes ) )
		{
			foreach ( $attributes as $index => &$attr )
			{
				if ( $attr instanceof Compiler_Attribute && !$attr->getNamespace() )
				{
					$_extra[ $attr->getName() ] = $attr->getValue();
				}
			}
		}

		$this->setStartTag( 'Widget::loadWidget(' . $name . ', ' . $method . ', array(' . var_export( $_extra, true ) . ') );' );
	}

}