import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';

const NewsTab = ({ country }) => {
  // Mock news data for different countries
  const newsData = {
    'Canada': [
      {
        id: 1,
        title: 'Canada Celebrates 20 Years of Same-Sex Marriage Rights',
        snippet: 'The country marks two decades since becoming one of the first nations to legalize same-sex marriage, with nationwide celebrations planned.',
        source: 'CBC News',
        date: 'July 20, 2025'
      },
      {
        id: 2,
        title: 'New Anti-Discrimination Bill Strengthens LGBTQIA+ Protections',
        snippet: 'Federal government introduces comprehensive legislation to enhance protections for LGBTQIA+ individuals in employment and housing.',
        source: 'The Globe and Mail',
        date: 'July 15, 2025'
      },
      {
        id: 3,
        title: 'Pride Month Events Draw Record Attendance Across Major Cities',
        snippet: 'Toronto, Vancouver, and Montreal report unprecedented participation in Pride celebrations, signaling growing acceptance.',
        source: 'CTV News',
        date: 'July 10, 2025'
      }
    ],
    'Uganda': [
      {
        id: 1,
        title: 'Controversial Anti-LGBTQIA+ Law Faces International Criticism',
        snippet: 'Human rights organizations condemn recent legislation that imposes severe penalties for same-sex relationships.',
        source: 'BBC News',
        date: 'July 25, 2025'
      },
      {
        id: 2,
        title: 'UN Calls for Repeal of Discriminatory Laws',
        snippet: 'United Nations human rights experts urge Uganda to reconsider laws that criminalize LGBTQIA+ individuals.',
        source: 'Reuters',
        date: 'July 22, 2025'
      },
      {
        id: 3,
        title: 'LGBTQIA+ Activists Face Increased Harassment',
        snippet: 'Reports indicate rising incidents of violence and discrimination against LGBTQIA+ community members.',
        source: 'Al Jazeera',
        date: 'July 18, 2025'
      }
    ],
    'Brazil': [
      {
        id: 1,
        title: 'São Paulo Pride Parade Sets New Attendance Record',
        snippet: 'Annual celebration draws over 3 million participants, showcasing growing acceptance in Brazil\'s largest city.',
        source: 'Folha de S.Paulo',
        date: 'July 23, 2025'
      },
      {
        id: 2,
        title: 'Supreme Court Considers Nationwide Anti-Discrimination Law',
        snippet: 'Judges debate comprehensive legislation to protect LGBTQIA+ rights across all Brazilian states.',
        source: 'O Globo',
        date: 'July 20, 2025'
      },
      {
        id: 3,
        title: 'Rural Areas Show Mixed Progress on LGBTQIA+ Rights',
        snippet: 'While major cities advance, conservative regions continue to face challenges in LGBTQIA+ acceptance.',
        source: 'Estadão',
        date: 'July 17, 2025'
      }
    ],
    'Russia': [
      {
        id: 1,
        title: 'Anti-LGBTQIA+ Propaganda Law Expanded to Adults',
        snippet: 'Controversial legislation now applies to all age groups, further restricting LGBTQIA+ rights and expression.',
        source: 'TASS',
        date: 'July 24, 2025'
      },
      {
        id: 2,
        title: 'International Organizations Condemn Rights Violations',
        snippet: 'Human rights groups report increased persecution of LGBTQIA+ individuals under new legal framework.',
        source: 'Interfax',
        date: 'July 21, 2025'
      },
      {
        id: 3,
        title: 'LGBTQIA+ Community Faces Growing Challenges',
        snippet: 'Activists report rising incidents of harassment and discrimination in major Russian cities.',
        source: 'RIA Novosti',
        date: 'July 19, 2025'
      }
    ],
    'Australia': [
      {
        id: 1,
        title: 'Sydney WorldPride 2025 Preparations Underway',
        snippet: 'City prepares to host the largest LGBTQIA+ celebration in the Southern Hemisphere next year.',
        source: 'ABC News',
        date: 'July 26, 2025'
      },
      {
        id: 2,
        title: 'New Gender Recognition Laws Pass Parliament',
        snippet: 'Legislation simplifies the process for transgender individuals to update official documents.',
        source: 'The Sydney Morning Herald',
        date: 'July 23, 2025'
      },
      {
        id: 3,
        title: 'LGBTQIA+ Tourism Booms in Major Cities',
        snippet: 'Melbourne and Sydney report significant increase in LGBTQIA+ friendly tourism and events.',
        source: 'The Age',
        date: 'July 20, 2025'
      }
    ],
    'Japan': [
      {
        id: 1,
        title: 'Tokyo District Court Rules on Same-Sex Marriage',
        snippet: 'Landmark decision expected to influence nationwide debate on marriage equality in Japan.',
        source: 'The Japan Times',
        date: 'July 25, 2025'
      },
      {
        id: 2,
        title: 'LGBTQIA+ Representation in Media Increases',
        snippet: 'Japanese television and film industry shows growing acceptance of LGBTQIA+ characters and stories.',
        source: 'Asahi Shimbun',
        date: 'July 22, 2025'
      },
      {
        id: 3,
        title: 'Tokyo Rainbow Pride Celebrates 15th Anniversary',
        snippet: 'Annual event draws record crowds, reflecting changing attitudes in Japanese society.',
        source: 'Mainichi Shimbun',
        date: 'July 19, 2025'
      }
    ],
    'Germany': [
      {
        id: 1,
        title: 'Berlin Hosts European LGBTQIA+ Rights Conference',
        snippet: 'International leaders gather to discuss advancing LGBTQIA+ rights across Europe.',
        source: 'Deutsche Welle',
        date: 'July 27, 2025'
      },
      {
        id: 2,
        title: 'New Anti-Discrimination Measures Announced',
        snippet: 'Federal government introduces comprehensive protections for LGBTQIA+ individuals in all sectors.',
        source: 'Der Spiegel',
        date: 'July 24, 2025'
      },
      {
        id: 3,
        title: 'German Cities Rank Among World\'s Most LGBTQIA+ Friendly',
        snippet: 'Berlin, Hamburg, and Cologne recognized for their inclusive policies and vibrant communities.',
        source: 'Frankfurter Allgemeine',
        date: 'July 21, 2025'
      }
    ],
    'South Africa': [
      {
        id: 1,
        title: 'Cape Town Pride Festival Draws International Attention',
        snippet: 'Annual celebration showcases South Africa\'s progressive stance on LGBTQIA+ rights.',
        source: 'Mail & Guardian',
        date: 'July 26, 2025'
      },
      {
        id: 2,
        title: 'Constitutional Court Upholds LGBTQIA+ Rights',
        snippet: 'Landmark ruling reinforces protections for LGBTQIA+ individuals under South African constitution.',
        source: 'Business Day',
        date: 'July 23, 2025'
      },
      {
        id: 3,
        title: 'Rural Areas Face Challenges in LGBTQIA+ Acceptance',
        snippet: 'While urban centers progress, traditional communities continue to struggle with LGBTQIA+ inclusion.',
        source: 'City Press',
        date: 'July 20, 2025'
      }
    ]
  };

  const countryNews = newsData[country.name] || [
    {
      id: 1,
      title: 'No Recent News Available',
      snippet: 'News information for this country is currently unavailable.',
      source: 'Galois',
      date: 'N/A'
    }
  ];

  const renderNewsItem = ({ item }) => (
    <View style={styles.newsItem}>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSnippet}>{item.snippet}</Text>
      <View style={styles.newsMeta}>
        <Text style={styles.newsSource}>{item.source}</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent LGBTQIA+ News</Text>
      <FlatList
        data={countryNews}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.newsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  newsList: {
    paddingBottom: 20,
  },
  newsItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSnippet: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default NewsTab; 