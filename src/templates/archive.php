<?php
/**
 * The template for displaying archive pages.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package {{themeName}}
 * @since {{version}}
 */

get_header();
?>

<div id="content-wrapper" class="site__wrapper--archive">
	<div id="content" class="content__wrapper" tabindex="-1">
		<main id="main" class="site__main">
			<?php if ( have_posts() ) : ?>

				<?php while ( have_posts() ) : the_post(); ?>
					<?php
						// Load loop-templates for archive
						get_template_part( 'loop-templates/content', get_post_format() );
					?>
				<?php endwhile; // end of the loops ?>

			<?php else : ?>

				<?php
					// Load loop-templates for empty content
					get_template_part( 'loop-templates/content', 'none' );
				?>

			<?php endif; ?>
		</main><!-- #main -->

		<!-- The pagination component -->
		<?php {{themeFnPrefix}}_pagination(); ?>

	</div><!-- #content -->

	<?php get_sidebar(); // load the sidebar ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>