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
 * @package      Config
 * @version      3.0.0 Beta
 * @category     Config
 * @copyright    2008-2013 Marcel Domke
 * @license      http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author       Marcel Domke <http://www.dcms-studio.de>
 * @link         http://www.dcms-studio.de
 * @file         Model.php
 */
class Modules_Config_Model
{

	/**
	 * @return array
	 */
	public static function getConfig ()
	{

		return array (
			'TranslationTables' => array (
				'news'            => array (
					'id'    => array (
						'type'      => 'int',
						'length'    => 10,
						'default'   => 0,
						'index'     => true,
						'isprimary' => true
					),
					'title' => array (
						'type'   => 'varchar',
						'length' => 200
					),
					'text'  => array (
						'type' => 'text'
					)
				),
				'news_categories' => array (
					'id'           => array (
						'type'      => 'int',
						'length'    => 10,
						'default'   => 0,
						'index'     => true,
						'isprimary' => true
					),
					'title'        => array (
						'type'   => 'varchar',
						'length' => 200
					),
					'description'  => array (
						'type' => 'text'
					),
					'teaserheader' => array (
						'type'   => 'varchar',
						'length' => 250
					),
				)
			),
			'tables'            => array (
				'news'            => array (
					'useTranslation'  => true,
					'transPK'         => 'itemid',
					'mainPK'          => 'id',
					'useMetadata'     => true,
					'translateFields' => array (
						'title',
						'text'
					),
					'sourcemode'      => 'news/item'
				),
				'news_categories' => array (
					'useTranslation' => true,
					'transPK'        => '',
					'mainPK'         => '',
					'useMetadata'    => true,
					'sourcemode'     => 'news/index'
				)
			)
		);
	}

	/**
	 * @return array
	 */
	public static function getConfiguraton ()
	{

		return array (
			'tables' => array (
				'news'            => array (
					'useTranslation' => true,
					'transPK'        => '',
					'mainPK'         => '',
					'useMetadata'    => true
				),
				'news_categories' => array (
					'useTranslation' => true,
					'transPK'        => '',
					'mainPK'         => '',
					'useMetadata'    => true
				)
			)
		);
	}

}
